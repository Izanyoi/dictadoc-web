import { useContext, useState} from 'react';
import { createDownloadableTranscript, promptDownload } from "../services/transcript_file";
import { WorkspaceContext } from "./workspace";

type Status = 'Ready' | 'Loading';

export function DownloadButton() {
    const [status, setStatus] = useState<Status>('Ready');

    const {Tid} = useContext(WorkspaceContext);

    return (
        <div className="DownloadButton"
            onClick={async () => {
                if (status == 'Loading') return;
                setStatus('Loading');

                // If this gets too expensive, make it store the result in downloadStore and allow use later
                const file = await createDownloadableTranscript(Tid);
                promptDownload(file, Date.now().toString()); 
                URL.revokeObjectURL(file);

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