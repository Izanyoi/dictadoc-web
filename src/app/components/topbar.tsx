import { useContext } from "react";
import { EditableInput } from "../../components/editable_box";
import { DownloadButton } from "./download_button";
import { RecordButton } from "./record_button";
import { WorkspaceContext } from "./workspace";
import { useMetadataStore } from "../data/transcript_data";
import { useWebSocketStore } from "../../utils/websocket";


export function TopBar({title, time, tags, searchHook}: {
    title: string,
    time: number,
    tags: string[],
    searchHook: any,
}) {
    const saveTitle = useMetadataStore(state => state.updateTranscriptTitle);
    const saveTags = useMetadataStore(state => state.updateTranscriptTags);

    const { searchState, query, handleSearch, handleNext, handlePrev } = searchHook;

    const {Tid} = useContext(WorkspaceContext);

    const handleTitleSave = (newTitle: string) => {
        const newTags = newTitle.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];
        const cleanedTitle = newTitle.replace(/#\w+/g, '').trim();
        saveTitle(Tid, cleanedTitle);
        saveTags(Tid, newTags);
    };

    const handleTagRemove = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        saveTags(Tid, newTags);
    };

    return (
        <div id='TopBar'>
            <div className="TranscriptName">
                <EditableInput value={title} onSave={handleTitleSave} className="TranscriptName Title" />
                <p>{new Date(time).toLocaleString()}</p>
                <div className="TagsContainer">
                    {tags.map(tag => <span key={tag} className="Tag" onClick={() => handleTagRemove(tag)}>{tag}</span>)}
                </div>
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
            color = 'orange';
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