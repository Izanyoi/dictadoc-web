import { useContext } from "react";
import { EditableInput } from "../../components/editable_box";
import { useMetadataStore } from "../data/transcript_data";
import { DownloadButton } from "./download_button";
import { RecordButton } from "./record_button";
import { WorkspaceContext } from "./workspace";
import { useWebSocketStore } from "../../utils/websocket";


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
                <WebsocketStatusIndicator />
                
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

function WebsocketStatusIndicator() {
    const webSocketStatus = useWebSocketStore(state=>state.status);
    let color: string;
    switch (webSocketStatus) {
        case 'connecting':
            color = 'yellow';
            break;

        case 'connected':
            color = 'green';
            break;

        case 'disconnected':
            color = 'red';
            break;

        case 'error':
            color = 'red';
            break;
    }

    const capitalized = webSocketStatus.charAt(0).toUpperCase() + webSocketStatus.slice(1);

    return (
        <div className="connection-status">
            <div className="status-dot" 
                style={{backgroundColor: color}}
            />
            <div>{capitalized}</div>
        </div>
    )
}