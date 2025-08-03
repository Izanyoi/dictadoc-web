import { StrictMode, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { NewWorkspace } from './components/new_workspace.tsx';
import { Sidebar } from './components/sidebar.tsx';
import { Workspace } from './components/workspace.tsx';
import { usePopupStore, useWorkspaceState } from './data/app_data.ts';

import './styles/app.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorLog />
        <Popup />
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
                {transcript == "" 
                    ? <NewWorkspace/> 
                    : <Workspace Tid={transcript} Wid={0}/>
                }
            </div>
        </div>
    )
}

function ErrorLog() {
    return <></>
}

// Popup component - Full screen overlay that catches ALL input
function Popup() {
    const PopupStore = usePopupStore();

    // Handle all mouse events (click backdrop to close, block everything else)
    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        // Only close if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) PopupStore.closePopup();
        e.stopPropagation();
    };

    if (!PopupStore.isOpen) return null;

    return (
        <div id="PopupShade"
            onClick={(e) => handleBackdropClick(e)}
            style={{ 
                pointerEvents: 'all', // Ensure this captures ALL events
                overflow: 'hidden'
            }}
        >
            <div id="Popup">
                <h3>{PopupStore.title}</h3>
                <hr />
                <div>
                    {PopupStore.content}
                </div>
            </div>
        </div>
    );
};