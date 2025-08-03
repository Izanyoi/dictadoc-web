import { useContext, useEffect, useRef } from 'react';
import { WorkspaceContext } from "./workspace";
import { createNewTranscript } from "../data/transcript_data";
import { useRecordingStore } from '../services/recording';

export function RecordButton() {
    const AudioStatus = useRecordingStore(state => state);
    const recordStatus = AudioStatus.recording == null;

    const buttonRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    const {Tid} = useContext(WorkspaceContext);

    useEffect(() => {
        if (!recordStatus && AudioStatus.stream) {
            setupVolumeFeedback(AudioStatus.stream);
        } else {
            stopVolumeFeedback();
        }

        return () => stopVolumeFeedback();
    }, [recordStatus]);

    const setupVolumeFeedback = (stream: MediaStream) => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        animate();
    };

    const animate = () => {
        if (!analyserRef.current || !dataArrayRef.current || !buttonRef.current) return;

        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            const val = dataArrayRef.current[i] - 128;
            sum += val * val;
        }
        const volume = Math.sqrt(sum / dataArrayRef.current.length);

        // Map volume to shadow size
        const shadowSize = Math.min(30, volume * 2.5); // adjust multiplier as needed
        buttonRef.current.style.boxShadow = `0 0 ${shadowSize}px ${shadowSize / 2}px rgba(0, 255, 0, 0.6)`;

        animationRef.current = requestAnimationFrame(animate);
    };

    const stopVolumeFeedback = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();

        animationRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
        audioContextRef.current = null;
        if (buttonRef.current) {
            buttonRef.current.style.boxShadow = '';
        }
    };

    if (!AudioStatus.recorder) {
        return (
            <div id="RecordButton" className="Error">
                Enable Microphone
            </div>
        );
    }

    return (
        <div
            id="RecordButton"
            ref={buttonRef}
            className={recordStatus ? "Idle" : "Recording"}
            onClick={() => {
                if (recordStatus) {
                    const Tid = createNewTranscript();
                    AudioStatus.startRecording(Tid);
                } else {
                    AudioStatus.stopRecording();
                }
            }}
        >
            {   recordStatus
                ?   <svg /* Microphone Icon */
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        width="16" height="16" viewBox="0 0 16 16"
                    >
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                    </svg> 

                :   <svg /* Stop Icon */
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="currentColor"
                        width="16" height="16" viewBox="0 0 16 16"
                    >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5z"/>
                    </svg>
            }
            {recordStatus ? 'Record' : 'Stop'}
        </div>
    );
}
