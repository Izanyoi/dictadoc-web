import { useAudioStore } from "../utils/audio";

import { useEffect, useRef} from 'react';

export function RecordButton({ Tid }: { Tid: number }) {
    const AudioStatus = useAudioStore(state => state);
    const recordStatus = AudioStatus.recording === 0;

    const buttonRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

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
                    AudioStatus.startRecording(Tid);
                } else {
                    AudioStatus.stopRecording();
                }
            }}
        >
            <img src={recordStatus ? '/mic.svg' : '/stop.svg'} />
            {recordStatus ? 'Record' : 'Stop'}
        </div>
    );
}
