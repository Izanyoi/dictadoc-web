import { useState, useRef, Fragment, type ReactNode } from 'react';

export type Direction = 'horizontal' | 'vertical';

/** 
 * A single pane 
 */
export interface Pane {
    content: ReactNode;
    initialSize: number;
    minSize?: number;
    maxSize?: number;
    style?: React.CSSProperties;
}

interface VSplitterProps {
    direction: 'vertical',
    panes: Pane[],
    width?: number,
    height: number,
}

interface HSplitterProps {
    direction: 'horizontal',
    panes: Pane[],
    width: number,
    height?: number,
}

/**
 * Returns a resizeable component
 * 
 * @param direction - horizontal or vertical, orientation of the the split
 * @param panes - an array of the individual panes. See interface Pane
 * @param height - the height of the splitter
 * @param width - the width of the splitter
 */
export function Splitter(props: VSplitterProps | HSplitterProps) {
    const isHorizontal = props.direction === 'horizontal';
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [panePositions, setPanePositions] = useState<number[]>(
        () => {
            const positions = [0];

            // Ignore the initial size of the last pane and make it take the rest of the space
            for (let i = 0, pos = 0; i < props.panes.length - 1; i++) {
                pos += props.panes[i].initialSize;
                positions[i + 1] = pos;
            }
            positions.push(isHorizontal ? props.width : props.height);

            return positions;
        }
    );

    const startResize = (index: number) => {
    
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) {
                throw new Error('Something went wrong in the DOM!');
            }
      
            const container = containerRef.current.getBoundingClientRect();
      
            const newPos = isHorizontal 
                ? e.clientX - container.left
                : e.clientY - container.top;
      
            const min = panePositions[index - 1];
            const max = panePositions[index + 1];
            const clampedPosition = Math.min(Math.max(newPos, min), max);
            
            const newArray = panePositions.slice();
            newArray[index] = clampedPosition;
            setPanePositions(newArray);
        };
    
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className='ResizeableContainer'
            ref={containerRef}
            style={{
                display: isHorizontal ? "flex" : "block",
                height: props.height ?? '100%',
                width: props.width ?? '100%',
                border: '1px solid black',
            }}
        >

            <div className='Pane'
                style={{
                    width: isHorizontal ? `${panePositions[1]}px` : '100%',
                    height: isHorizontal ? '100%' : `${panePositions[1]}px`,
                    overflow: 'hidden',
                }}
            >
                {props.panes[0].content}
            </div>

            {props.panes.slice(1).map((pane, index) => {
                return (
                    <Fragment>
                        <div className='ResizeBar'
                            onMouseDown={()=>startResize(index + 1)}
                            style={{
                                width: isHorizontal ? '3px' : '100%',
                                height: isHorizontal ? '100%' : '3px',
                                cursor: isHorizontal ? 'col-resize' : 'row-resize',
                                background: 'yellow',
                                flexShrink: 0,
                            }}
                        />

                        <div className='Pane'
                            style={{
                            width: isHorizontal ? `${panePositions[index+2]-panePositions[index+1]}px` : '100%',
                            height: isHorizontal ? '100%' : `${panePositions[index+2]-panePositions[index+1]}px`,
                            overflow: 'hidden',
                        }}>
                            {pane.content}
                        </div>
                    </Fragment>
                );
            })}    
        </div>
  );
};