import { StrictMode, createContext } from 'react'
import { createRoot } from 'react-dom/client'

//Fetch from server with account
const transcripts = createContext([]);
const transcripts2 = createContext([]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div id='SideBar'>
            <transcripts.Provider value={bruh}>

            </transcripts.Provider>
        </div>

        <div id='Main'>
            <div id='TopBar'>

            </div>

            <div id='EditorTop'>
                <div id='FixedButtons'>
                    //This is a comment
                    <div id='TopButton'>Export</div>
                    <div id='RecordButton'>Record</div>
                </div>
            </div>

            <div id='Editor'>

            </div>
        </div>
    </StrictMode>
)