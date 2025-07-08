import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Workspace } from './workspace.tsx'
import { Sidebar } from './sidebar.tsx'
import { useWorkspaceState } from './app_data.tsx'

import '../styles/app.css'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>   
    </StrictMode>
)

function App() {
    const transcript = useWorkspaceState(state => state.workspaces[0]);
    
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
        }}>

            <Sidebar />
            <div id="Workspace" style={{width: "100%", height: "100vh"}}>
                {transcript === 0 
                    ? <NewWorkspace/> 
                    : <Workspace Tid={transcript} Wid={0}/>
                }
            </div>
        </div>
    )
}

function NewWorkspace() {
    return (
        <>
        </>
    )
}