import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Workspace } from './workspace.tsx'
import { Sidebar } from './sidebar.tsx'

import './styles/app.css'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>   
    </StrictMode>
)

function App() {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
        }}>

            <Sidebar />
            <div id="Workspace" style={{width: "100%", height: "100vh"}}>
                <Workspace Tid={1} Wid={0}/>
            </div>
        </div>
    )
}