import { type ReactNode } from 'react';
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware';

type WorkspaceStore = {
    workspaces: Record<number, number>;

    setWorkspace: (Wid: number, Tid: number) => void;
}

export const useWorkspaceState = create<WorkspaceStore>() (
    subscribeWithSelector((set, get) => ({
        workspaces: {
            0: 1
        },

        setWorkspace: (Wid, Tid) => {
            set((state) => ({
                workspaces: {
                    ...state.workspaces,
                    [Wid]: Tid
                }
            }))
            console.log("Set it!")
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