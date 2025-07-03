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