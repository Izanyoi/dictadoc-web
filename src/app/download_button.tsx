import { useAudioStore } from "../utils/audio";

import { useEffect, useRef, useState} from 'react';
import { useDownloadStore } from "./app_data";
import { createDownloadableTranscript } from "./transcript_file";

type Status = 'Ready' | 'Loading';

export function DownloadButton({ Tid }: { Tid: number }) {
    const [status, setStatus] = useState<Status>('Ready');

    return (
        <div className="DownloadButton"
            onClick={async () => {
                if (status == 'Loading') return;
                
                setStatus('Loading');
                const url = await createDownloadableTranscript(Tid);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'transcript.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setStatus('Ready');
            }}    
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
            </svg>
        </div>
    );
}