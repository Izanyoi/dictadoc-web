export function formatTimestamp(ms: number): string {
    const totalMs = Math.floor(ms);
    const hours = (totalMs / 3600000) | 0;
    const minutes = ((totalMs % 3600000) / 60000) | 0;
    const seconds = ((totalMs % 60000) / 1000) | 0;

    return (
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds
    );
}

/**
 * You must manually clean up the howl reference after you're done with it using .cleanup on the returned
 * object otherwise you will cause a memory leak
 * @param blob - the audio blob to be wrapped in a Howl
 * @returns the associated Howl with cleanup method (audio as any).cleanup()
 */
export function createHowl(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const howl = new Howl({
        src: [url],
        preload: true,
        format: ['mp3', 'wav', 'ogg'],
        onloaderror: (id, error) => {
            console.error('Failed to load audio:', error);
            cleanup();
        }
    });
   
    const cleanup = () => {
        howl.stop();
        howl.unload();
        URL.revokeObjectURL(url);
    };
   
    howl.on('loaderror', cleanup);
   
    // Expose cleanup for manual calling
    (howl as any).cleanup = cleanup;
   
    return howl;
}