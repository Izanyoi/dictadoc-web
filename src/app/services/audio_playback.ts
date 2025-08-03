import { create } from "zustand";
import { Howl } from "howler";
import { useWorkspaceState } from "../data/app_data";
import { useTranscriptContentStore } from "../data/transcript_data";
import { createHowl } from "../../utils/audio";

type TrackState = {
    Tid: string;
    howl: Howl;
    soundId?: number;
    endTime?: number;
    checkInterval?: number;
};

type PlaybackStore = {
    howls: Record<string, Howl>;
    tracks: Record<number, TrackState>;

    loadAudio: (Tid: string, audioSrc: Blob) => void;
    removeAudio: (Tid: string) => void;

    resumeTrack: (track: number) => void;
    playSegment: (Tid: string, start: number, end: number, track: number) => void;
    pause: (Tid: string) => void;
    pauseTrack: (track: number) => void;
    pauseAll: () => void;
    syncWithWorkspace: (workspaceState: Record<number, string>) => void;
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
    howls: {},
    tracks: {},

    loadAudio: async (Tid, audioSrc) => {
        const howl = createHowl(audioSrc);

        set((state) => ({
            howls: {
                ...state.howls,
                [Tid]: howl,
            },
        }));
    },

    removeAudio: (Tid) => {
        set((state) => {
            const howlToRemove = state.howls[Tid];
            if (!howlToRemove) return state;

            // Use the cleanup method
            (howlToRemove as any).cleanup?.();

            const newHowls = { ...state.howls };
            delete newHowls[Tid];

            const newTracks = { ...state.tracks };
            Object.keys(newTracks).forEach((trackKey) => {
                const trackId = parseInt(trackKey);
                if (newTracks[trackId]?.Tid === Tid) {
                    const trackState = newTracks[trackId];
                    // Clear any intervals
                    if (trackState.checkInterval) {
                        clearInterval(trackState.checkInterval);
                    }
                    delete newTracks[trackId];
                }
            });

            return { howls: newHowls, tracks: newTracks };
        });
    },

    resumeTrack: (track) => {
        const trackState = get().tracks[track];
        if (trackState?.soundId !== undefined) {
            trackState.howl.play(trackState.soundId);
        }
    },

    playSegment: (Tid, start, end, track) => {
        const { howls, pauseTrack } = get();
        
        // Pause any existing track
        pauseTrack(track);
        
        const howl = howls[Tid];
        if (!howl) {
            console.warn(`Audio with ID ${Tid} not found`);
            return;
        }

        // Convert centiseconds to seconds
        const startTime = start / 100;
        const endTime = end / 100;

        // Play from the start position
        const soundId = howl.play();
        howl.seek(startTime, soundId);

        // Set up interval to check for end time
        const checkInterval = setInterval(() => {
            const currentTime = howl.seek(soundId) as number;
            if (currentTime >= endTime) {
                clearInterval(checkInterval);
                get().pauseTrack(track);
            }
        }, 50) as unknown as number; // Check every 50ms for smooth stopping

        set((state) => ({
            tracks: {
                ...state.tracks,
                [track]: { 
                    Tid, 
                    howl, 
                    soundId, 
                    endTime,
                    checkInterval 
                },
            },
        }));
    },

    pause: (Tid) => {
        const { tracks, pauseTrack } = get();
        // Find all tracks playing this Tid and pause them
        Object.keys(tracks).forEach(trackKey => {
            const trackId = parseInt(trackKey);
            if (tracks[trackId]?.Tid === Tid) {
                pauseTrack(trackId);
            }
        });
    },

    pauseTrack: (track) => {
        set((state) => {
            const trackState = state.tracks[track];
            if (!trackState) return state;

            const { howl, soundId, checkInterval } = trackState;

            // Stop the sound
            if (soundId !== undefined) {
                howl.pause(soundId);
            }

            // Clear the check interval
            if (checkInterval) {
                clearInterval(checkInterval);
            }

            // Remove the track from state
            const newTracks = { ...state.tracks };
            delete newTracks[track];

            return { tracks: newTracks };
        });
    },

    pauseAll: () => {
        set((state) => {
            const newTracks = { ...state.tracks };
            
            Object.keys(newTracks).forEach(trackKey => {
                const trackId = parseInt(trackKey);
                const trackState = newTracks[trackId];
                if (trackState) {
                    // Stop the sound
                    if (trackState.soundId !== undefined) {
                        trackState.howl.pause(trackState.soundId);
                    }
                    // Clear intervals
                    if (trackState.checkInterval) {
                        clearInterval(trackState.checkInterval);
                    }
                }
            });
            
            return { tracks: {} };
        });
    },

    syncWithWorkspace: (workspaceState) => {
        const { howls, removeAudio, loadAudio } = get();
        const activeTids = new Set(Object.values(workspaceState).filter(tid => tid));

        // Remove audios that are no longer in the workspace
        Object.keys(howls).forEach(tid => {
            if (!activeTids.has(tid)) {
                removeAudio(tid);
            }
        });

        // Load new audios that have been added
        activeTids.forEach(tid => {
            if (!howls[tid]) {
                const blob = useTranscriptContentStore.getState().transcriptContent[tid]?.audio;
                if (blob) {
                    loadAudio(tid, blob);
                }
            }
        });
    },
}));

useWorkspaceState.subscribe(
    (state) => state.workspaces,
    (workspaces) => {usePlaybackStore.getState().syncWithWorkspace(workspaces)}
);