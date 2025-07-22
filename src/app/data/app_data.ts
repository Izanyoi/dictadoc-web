import { type ReactNode } from 'react';
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware';

type WorkspaceStore = {
    workspaces: Record<number, string>;

    setWorkspace: (Wid: number, Tid: string) => void;
}

export const useWorkspaceState = create<WorkspaceStore>() (
    subscribeWithSelector((set, get) => ({
        workspaces: {
            0: ""
        },

        setWorkspace: (Wid, Tid) => {
            set((state) => ({
                workspaces: {
                    ...state.workspaces,
                    [Wid]: Tid
                }
            }))
        }
    }))
);


type PopupStore = {
    isOpen: boolean;
    content: ReactNode;
    title: string;

    openPopup: (title: string, content: ReactNode) => void
    closePopup: () => void,
}

export const usePopupStore = create<PopupStore>((set) => ({
    isOpen: false,
    content: null,
    title: "",
    openPopup: (title, content) => set({ isOpen: true, content, title }),
    closePopup: () => set({ isOpen: false, content: null, title: "" }),
}));


type DownloadState = {
    status: "None" | "Loading" | "Ready",
    file: string | null,
}

type DownloadStore = {
    downloads: Record<string, DownloadState>,

    setStatus: (id: number, status: "None" | "Loading" | "Ready") => void;
    updateFile: (id: number, url: string) => void,
}

export const useDownloadStore = create<DownloadStore>() (
    subscribeWithSelector((set, get) => ({
        downloads: {
            0: {
                status: "None",
                file: null,
            }
        },

        setStatus: (id, status) => {
            const prev = get().downloads[id]?.file;

            set((state) => ({
                downloads: {
                    ...state.downloads,
                    [id]: {
                        status: status,
                        file: prev ?? null,
                    }
                }
            }))
        },

        updateFile: (id, url) => {
            const prevUrl = get().downloads[id]?.file;

            set((state) => ({
                downloads: {
                    ...state.downloads,
                    [id]: {
                        status: "Ready",
                        file: url,
                    }
                }
            }));

            if (prevUrl) URL.revokeObjectURL(prevUrl);
        }
    }))
);