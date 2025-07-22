import { motion } from "motion/react";
import { memo, useRef, useContext, useEffect } from "react";
import { EditableBox } from "../../components/editable_box";
import { formatTimestamp } from "../../utils/audio";
import { useTranscriptContentStore } from "../data/transcript_data";
import type { TranscriptEntry } from "../data/types";
import { WorkspaceContext } from "./workspace";

const TranscriptEntryComponent = memo(
    function TranscriptEntryComponent({ index, data, selected, startTime, endTime }: {
        index: number,
        data: TranscriptEntry,
        selected: boolean,
        startTime: number,
        endTime: number,
    }) {
        const saveEdit = useTranscriptContentStore.getState().updateTranscriptEntry;
        const entryRef = useRef<HTMLDivElement>(null);

        const {Tid} = useContext(WorkspaceContext);

        useEffect(() => {
            entryRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, [selected])

        return (
            <motion.div
                ref={entryRef}
                className={`Transcript ${selected ? "Selected" : ""}`}
            >
                <div className="ReplayButton"
                    onClick={()=>{/*PlayAudio(Tid, start, end)*/}}
                >
                    <img src="/play-fill.svg" />
                </div>

                <div className="TranscriptL">
                    <div className="SpeakerTag">{data.speaker}</div>
                    <div className="TimestampTag">{formatTimestamp(data.timing)}</div>
                </div>

                <div className="TranscriptR">
                    <EditableBox value={data.content} 
                        onSave={(updated: string)=>{saveEdit(Tid, index, {content: updated})}}
                    /> 
                </div>
            </motion.div>
        );
    }, (prevProps, nextProps) => {
        // We skip memoizing if selected
        if (prevProps.selected || nextProps.selected) return false;

        return (
            prevProps.data === nextProps.data
        );
    }
);

export function TranscriptBox({Transcripts, selected}: {
    Transcripts: TranscriptEntry[], 
    selected: number,
}) {

    return (
        <div id="TranscriptBox">
            {Transcripts.map(
                (data, index) => {
                    const startTime = data.timing;
                    const endTime = Transcripts[index+1]?.timing;

                    return (
                        <TranscriptEntryComponent
                            index={index} 
                            data={data} 
                            selected={selected === index}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    )
                }
            )} 
        </div>
    );
}