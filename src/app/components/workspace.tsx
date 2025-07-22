import { useEffect, useRef, useContext, memo, createContext } from 'react'
import { useMetadataStore, useTranscriptContentStore } from '../data/transcript_data'
import { type TranscriptEntry } from '../data/types';
import { createAudio, formatTimestamp, playAudio } from '../../utils/audio'
import { EditableBox, EditableInput } from '../../components/editable_box'
import { RecordButton } from './record_button';
import { useListSearch } from '../../utils/search';

import '../styles/workspace.css'
import '../../styles/presets.css'
import { DownloadButton } from './download_button';
import { motion } from 'motion/react';

export type WorkspaceInfo = {
    Tid: string,
}

export const WorkspaceContext = createContext<WorkspaceInfo>({
    Tid: ""
});

export function Workspace ({Tid, Wid} : {Tid: string, Wid: number}) {
    const metadata = useMetadataStore(state => state.metadata[Tid]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[Tid]);

    const search = useListSearch(
        transcriptContent?.transcript || [],
        (entry: TranscriptEntry, query: string) => entry.content.toLowerCase().includes(query.toLowerCase())
    );
 

    return (
        <WorkspaceContext.Provider value={{Tid:Tid}}>
        <div id='Main'>
            <TopBar 
                title={metadata.title}
                time={metadata.time}
                searchHook={search}
            />
            <TranscriptBox
                Transcripts={transcriptContent.transcript}
                selected={search.searchState.currentIndex}
            />
        </div>
        </WorkspaceContext.Provider>
    )
}

export function TopBar({title, time, searchHook}: {
    title: string,
    time: number,
    searchHook: any,
}) {
    const saveTitle = useMetadataStore(state => state.updateTranscriptTitle);

    const { searchState, query, handleSearch, handleNext, handlePrev } = searchHook;

    const {Tid} = useContext(WorkspaceContext);

    return (
        <div id='TopBar'>
            <div className="TranscriptName">
                <EditableInput value={title} onSave={(newTitle: string) => saveTitle(Tid, newTitle)} className="TranscriptName Title" />
                <p>{new Date(time).toLocaleString()}</p>
            </div>
            
            <div id="CenterContainer">
                <div className="connection-status">
                    <div className="status-dot"/>
                    <div>Connected</div>
                </div>
                
                <div id="SearchBox" key={Tid} /* To force remount to clear search result */>
                    <input id="SearchInput"
                        type='text'
                        placeholder="Search..."
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <div>
                        <button onClick={()=> handlePrev()}>▲</button>
                        <button onClick={()=> handleNext()}>▼</button>
                    </div>
                </div>
                <div style={{fontSize: '10px', height: '0', margin: '0'}}>
                    {query.length === 0 
                        ? ""
                        : searchState.currentIndex === -1 
                            ? "No Results Found" 
                            : `${searchState.currentIndex + 1} of ${searchState.results.length} results`
                    }
                </div>
            </div>
            
            <div className='HFlex'>
                <DownloadButton />
                <RecordButton />
            </div>
        </div>
    )
}

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
        if (nextProps.selected) return false;

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
