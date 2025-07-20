import { useAddFullTranscript } from './transcript_data';
import { useAudioStore } from '../utils/audio';
import { HTTPClient } from '../utils/http_client';

import '../styles/presets.css';
import '../styles/workspace.css';
import { useWorkspaceState } from './app_data';


export function NewWorkspace() {
    const addTranscript = useAddFullTranscript();

    return (
        <div className="Full HFlex">
            {/* Upload File Button */}
            <div className="FlatButton 1">
                <label htmlFor="file-upload" className="Centered VFlex">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        width="60"
                        height="60"
                        viewBox="0 0 16 16"
                    >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                    </svg>
                    Upload an audio file
                </label>
                <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                />
            </div>

            {/* Record Button */}
            <div className="FlatButton 2">
                <div className="Centered VFlex"
                    onClick={() => {
                        const newTranscript = {
                            title: "Untitled Transcript",
                            time: Date.now(),
                            audio: null,
                            transcript: [
                                {speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}
                            ],
                        };

                        const id = addTranscript(newTranscript);

                        useAudioStore.getState().startRecording(id);
                        useWorkspaceState.getState().setWorkspace(0,id);
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        width="60"
                        height="60"
                        viewBox="0 0 16 16"
                    >
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                    </svg>
                    Start new recording
                </div>
            </div>

            {/* Guide Section */}
            <div>
                <div>
                    User Guide and Walkthroughs
                </div>
            </div>
        </div>
    );
}
