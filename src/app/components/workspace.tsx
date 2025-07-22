import { createContext } from 'react'
import { type TranscriptEntry } from '../data/types';
import { useMetadataStore, useTranscriptContentStore } from '../data/transcript_data'

import { TopBar } from './topbar';
import { TranscriptBox } from './transcript_box';

import { useListSearch } from '../../utils/search';

import '../styles/workspace.css'
import '../../styles/presets.css'


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

export function WebsocketStatusIndicator() {
    return (
        <div className="connection-status">
            <div className="status-dot"/>
            <div>Connected</div>
        </div>
    )
}
