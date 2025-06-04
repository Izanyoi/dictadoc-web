import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Splitter } from './splitter.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div>
            <Splitter
                direction="horizontal"
                width={500}
                height={500}
                panes={[
                    {
                        content: <div style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'red',
                        }}/>,
                        initialSize: 100,
                    }, 
                    {
                        content: <div style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'green',
                        }}/>,
                        initialSize: 100,
                    },
                    {
                        content: <div style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'blue',
                        }}/>,
                        initialSize: 100,
                    }
                ]}
            />
        </div>
    </StrictMode>
)