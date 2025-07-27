import { create } from 'zustand';

const url = "";

type Status = 'connected' | 'disconnected' | 'error' | 'connecting';

interface WebSocketState {
    status: Status;
    connect: () => void;
    disconnect: () => void;
    send: (data: any) => void;
}


let socket: WebSocket | null = null;
let reconnectInterval: number;

export const useWebSocketStore = create<WebSocketState>((set, get) => {
    const setStatus = (status: Status) => {
        set({ status });
    };

    const clearReconnectTimer = () => {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = 0;
        }
    };

    const tryReconnect = () => {
        if (reconnectInterval) return;
        reconnectInterval = setInterval(() => {
            if (get().status === 'disconnected' || get().status === 'error') {
                console.log('Attempting to reconnect WebSocket...');
                get().connect();
            }
        }, 10000);
    };

    return {
        status: 'disconnected',

        connect: () => {
            // Assume the status is connected
            if (socket && socket.readyState === WebSocket.OPEN) return;

            setStatus('connecting');
            socket = new WebSocket(url);

            socket.onopen = () => {
                setStatus('connected');
                clearReconnectTimer();
            };

            socket.onerror = () => {
                console.error('WebSocket error');
                setStatus('error');
                tryReconnect();
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                setStatus('disconnected');
                tryReconnect();
            };

            socket.onmessage = (msg) => {
                console.log(msg.data);
            }
        },

        disconnect: () => {
            socket?.close();
            socket = null;
            setStatus('disconnected');
        },

        send: (data: any) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(data);
            } else {
                console.warn('WebSocket not open. Cannot send message.');
            }
        },
    };
});