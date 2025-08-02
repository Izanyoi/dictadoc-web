import { create } from 'zustand';

type Status = 'connected' | 'disconnected' | 'error' | 'connecting';

interface WebSocketState {
    status: Status;
    url: string | null;
    messageHandler: (message: any) => void;
    errorHandler?: (error: Event) => void;
    
    setMessageHandler: (handler: (message: any) => void) => void;
    setErrorHandler: (handler: (error: Event) => void) => void;
    connect: (url?: string) => void;
    disconnect: () => void;
    send: (data: any) => void;
    isConnected: () => boolean;
}

let socket: WebSocket | null = null;
let reconnectInterval: number | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

export const useWebSocketStore = create<WebSocketState>((set, get) => {
    const setStatus = (status: Status) => {
        set({ status });
    };

    const clearReconnectTimer = () => {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };

    const tryReconnect = () => {
        if (reconnectInterval || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
        
        reconnectInterval = setInterval(() => {
            const currentState = get();
            if (currentState.status === 'disconnected' || currentState.status === 'error') {
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && currentState.url) {
                    console.log(`Attempting to reconnect WebSocket... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
                    reconnectAttempts++;
                    currentState.connect();
                } else {
                    console.log('Max reconnection attempts reached or no URL set');
                    clearReconnectTimer();
                    reconnectAttempts = 0;
                }
            } else {
                clearReconnectTimer();
                reconnectAttempts = 0;
            }
        }, RECONNECT_DELAY);
    };

    const cleanup = () => {
        clearReconnectTimer();
        if (socket) {
            socket.onopen = null;
            socket.onclose = null;
            socket.onerror = null;
            socket.onmessage = null;
            
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
            socket = null;
        }
    };

    return {
        status: 'disconnected',
        url: null,
        messageHandler: () => {
            console.warn('No message handler set');
        },

        setMessageHandler: (handler: (message: any) => void) => {
            set({ messageHandler: handler });
        },

        setErrorHandler: (handler: (error: Event) => void) => {
            set({ errorHandler: handler });
        },

        connect: (url?: string) => {
            const currentState = get();
            const wsUrl = url || currentState.url;
            
            if (!wsUrl) {
                console.error('WebSocket URL is required');
                setStatus('error');
                return;
            }

            if (url && url !== currentState.url) {
                set({ url });
            }

            if (socket && socket.readyState === WebSocket.OPEN && socket.url === wsUrl) {
                console.log('WebSocket already connected to this URL');
                return;
            }

            cleanup();

            setStatus('connecting');
            
            try {
                socket = new WebSocket(wsUrl);

                socket.onopen = (_) => {
                    console.log('WebSocket connected successfully');
                    setStatus('connected');
                    clearReconnectTimer();
                    reconnectAttempts = 0;
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setStatus('error');
                    
                    const errorHandler = get().errorHandler;
                    if (errorHandler) {
                        errorHandler(error);
                    } 
                    
                    tryReconnect();
                };

                socket.onclose = (event) => {
                    console.log('WebSocket disconnected:', {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean
                    });
                    
                    // Only set to disconnected if we're not already in error state
                    if (get().status !== 'error') {
                        setStatus('disconnected');
                    }
                    
                    // Only try to reconnect if it wasn't a clean close
                    if (!event.wasClean && event.code !== 1000) {
                        tryReconnect();
                    }
                };

                socket.onmessage = (event) => {
                    try {
                        // Try to parse JSON, fallback to raw data
                        let data;
                        try {
                            data = JSON.parse(event.data);
                        } catch {
                            data = event.data;
                        }
                        
                        const messageHandler = get().messageHandler;
                        if (messageHandler) {
                            messageHandler(data);
                        }
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                    }
                };

            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                setStatus('error');
                tryReconnect();
            }
        },

        disconnect: () => {
            cleanup();
            setStatus('disconnected');
            reconnectAttempts = 0;
            console.log('WebSocket manually disconnected');
        },

        send: (data: any) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                console.warn('WebSocket not connected. Cannot send message:', data);
                return false;
            }

            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                socket.send(message);
                return true;
            } catch (error) {
                console.error('Failed to send WebSocket message:', error);
                return false;
            }
        },

        isConnected: () => {
            return socket?.readyState === WebSocket.OPEN && get().status === 'connected';
        },
    };
});