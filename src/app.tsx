import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { type TabsState } from './app_data.ts'
import { Workspace } from './workspace.tsx'

import './styles/app.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>   
    </StrictMode>
)

const initialState: TabsState = {
    SelectedTab : 0,
    Tabs : [{name: "Placeholder Tab", id: 0}],
}

function App() {
    const [ SidebarExpanded, SetSidebar ] = useState(false);
    const [ AppState, SetAppState ] = useState(initialState);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
        }}>
            <div id="Sidebar">
                This is the sidebar. For stuff I suppose.
            </div>

            <div id="Workspace" style={{width: "100%", height: "90vh"}}>
                <div id="TabBar">
                    {AppState.Tabs.map( 
                        (tab, index) => {
                            return (
                                <div className={"Tab " + (index == AppState.SelectedTab ? "Selected" : "")}>
                                    {tab.name}
                                </div>
                            )
                        }
                    )}
                </div>

                <Workspace wId={0} />
            </div>
        </div>
    )
}