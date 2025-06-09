import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div id='TopBar'>
            <img id='Logo' src='https://placehold.co/400' />
            <div id='TabContainer'>
                <a href='' className='TopBarButton'>Pricing</a>
                <a href='' className='TopBarButton'>Reviews</a>
                <a href='' className='TopBarButton'>About Us</a>
                <a href='app.html' className='TopBarButton'>Login</a>
            </div>
        </div>


        <div id='ContentArea'>
            <div id='CenteredContent'>
                <div id='LeftSide'>
                    <h2>The future of medical transcription</h2>
                    <p>DictaDoc is a student-led canadian startup meant to aid doctors and nurses simplify the process 
                        of transcribing patient notes by leveraging modern audio-to-text AI. Designed by medical students,
                        for real professionals.</p>
                    
                    <a id='MainButton' href='./app.html'>Transcribe Now!</a>

                    <p>Alternatively, click <a href='' style={{color: '#005096'}}>here</a> to learn more!</p>
                </div>
                
                <div id='RightSide'>
                    <h3>Watch our Demo</h3>
                    <img src='https://placehold.co/400' />
                </div>
            </div>
        </div>

        <div id='BottomBar'>
            <p>Some additional links here, thank you.</p>
        </div>
    </StrictMode>
)