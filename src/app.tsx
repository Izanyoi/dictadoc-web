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
    Tabs : [{title: "Placeholder Tab", id: 1, time: 0, audio: "", transcript: []}],
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

                <div id="Workspace" style={{width: "100%", height: "100vh"}}>
                    <Workspace Id={1} />
                </div>
        </div>
    )
}