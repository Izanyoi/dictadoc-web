export class HTTPClient {
    static baseUrl: string = 'https://default-api.com';

    static setBaseUrl(url: string) {
        this.baseUrl = url;
    }

    private static getUrl(path: string, overrideUrl?: string): string {
        const base = overrideUrl ?? this.baseUrl;
        return `${base}${path}`;
    }

    static async uploadAudio(file: File | Blob, filename: string, overrideBaseUrl?: string): Promise<{ uploadId: string }> {
        const formData = new FormData();
        formData.append('audio', file, filename);

        const response = await fetch(this.getUrl('/upload', overrideBaseUrl), {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
    }

    static async transcribe(uploadId: string, overrideBaseUrl?: string): Promise<{ transcriptionId: string }> {
        const response = await fetch(this.getUrl('/transcribe', overrideBaseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uploadId }),
        });

        if (!response.ok) throw new Error('Transcription failed');
        return await response.json();
    }

    static async fetchTranscription(transcriptionId: string, overrideBaseUrl?: string): Promise<{ text: string; speakers: any[] }> {
        const response = await fetch(
            this.getUrl(`/transcription/${transcriptionId}`, overrideBaseUrl)
        );

        if (!response.ok) throw new Error('Fetch failed');
        return await response.json();
    }
}
