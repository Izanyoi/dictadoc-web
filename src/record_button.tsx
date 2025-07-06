import { useAudioStore } from "./audio";

export function RecordButton({Tid}: {Tid: number}) {
    const AudioStatus = useAudioStore(state=> state.recording);
    const AudioRecorder = useAudioStore(state=> state.recorder);
    const startRecording = useAudioStore(state => state.startRecording);
    const stopRecording = useAudioStore(state => state.stopRecording);

    if (!AudioRecorder) return (
        <div id="RecordButton"
            className="record-button error"
        >
            Enable Microphone
        </div>
    )

    return (
        <div id="RecordButton"
            className={AudioStatus === 0 ? "Idle" : "Recording"}
            onClick={() => {
                if (AudioStatus === 0) {
                    startRecording(Tid);
                } else {
                    stopRecording();
                }
            }}
        >
            <img src={AudioStatus === 0 ? '/mic.svg' : '/stop.svg'} />
            {AudioStatus === 0 ? 'Record' : 'Stop'}
        </div>
    );
}