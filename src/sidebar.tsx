import { useState } from "react"
import { useMetadataStore } from "./transcript_data"
import { useWorkspaceState } from "./app_data";

import './styles/sidebar.css'


export function Sidebar() {
    const [filters, setFilters] = useState({
        search: '',
        dateRange: { start: null, end: null },
    });
    
    const metadata = useMetadataStore(state => state.metadata);
    
    // Do ALL filtering in the component, not in the selector
    const filteredAndSorted = Object.values(metadata || {})
        .filter(entry => {
            if (!entry) return false;
            
            // Search filter
            if (filters.search && !entry.title?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            
            // Date range filter
            if (filters.dateRange.start && entry.time < filters.dateRange.start) {
                return false;
            }
            if (filters.dateRange.end && entry.time > filters.dateRange.end) {
                return false;
            }
            
            return true;
        })
        .sort((a, b) => (b.time || 0) - (a.time || 0));

    const selected = useWorkspaceState(state => state.workspaces[0]);

    return (
        <div id="Sidebar">
            <div id="Logo">
                <img id="Logo" src="https://placehold.co/400" />
                V0.1
            </div>

            <div id="Controls">

                <img className="Link" src="gear-fill.svg" />
                <img className="Link" src="person-fill.svg" />
                <img className="Link" src="bug-fill.svg" />
                
            </div>

            <div className="Filters">
                <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
            </div>

            <div id="Entries">
                {filteredAndSorted.map(entry => (
                    <Tab 
                        Tid={entry.id} 
                        title={entry.title} 
                        selected={entry.id===selected}/>
                ))}
            </div>
        </div>
    );
}

function Tab({Tid, title, selected}: {Tid: number, title: string, selected: boolean}) {
    const workspaceState = useWorkspaceState();
    
    if (!selected) return (
        <div className="Tab"
            onClick={()=>{workspaceState.setWorkspace(0, Tid)}}    
        >
            {title}
        </div>
    )
    else return (
        <div className="Tab Selected" key={Tid}>
            {title}
        </div>
    )
}