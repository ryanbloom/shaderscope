import { useState } from 'react'
import { Canvas } from './Canvas'
import { canvasSize, crosshairsSize } from './options'
import CrosshairsImage from './crosshairs-small.svg'

export function CanvasPane(props) {
    [dragging, setDragging] = useState(false)

    function flipY(y) {
        return canvasSize - y
    }

    function moveCrossHairs(e) {
        const r = e.target.getBoundingClientRect()
        const point = {
            x: e.clientX - r.left,
            y: r.top + r.height - e.clientY
        }
        props.hover(point)
        if (e.buttons) {
            props.lock(point)
        }
    }
    function getSource() {
        return props.shader.program.compile(props.variable)
    }

    let crosshairsDiv = props.lockedPoint
        ? <div style={{ 'left': props.lockedPoint.x - crosshairsSize / 2, 'top': flipY(props.lockedPoint.y) - crosshairsSize / 2 }}
            className='pointer-events-none absolute mix-blend-difference'>
            <CrosshairsImage />
        </div>
        : []
    return <div>
        <div style={{ width: canvasSize, height: canvasSize }}>
            
            <div className='rounded-md outline outline-2 outline-slate-200 dark:outline-slate-600 overflow-hidden'
                style={{ position: 'absolute' }}
                onMouseDown={moveCrossHairs}
                onMouseMove={moveCrossHairs}
                onMouseOut={() => props.hover(null)}
                onDoubleClick={() => props.lock(null)}>
                {crosshairsDiv}
                <Canvas width={canvasSize} height={canvasSize} shaderInputs={{ iTime: props.time, width: canvasSize, height: canvasSize }} fragmentSource={getSource()} />
            </div>
        </div>
    </div>
}
