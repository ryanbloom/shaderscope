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
        props.moveCrossHairs({
            x: e.clientX - r.left,
            y: r.top + r.height - e.clientY
        })
    }
    function getSource() {
        return props.shader.program.compile(props.shader.variable)
    }
    function mouseMove(e) {
        if (dragging) {
            moveCrossHairs(e)
        }
    }
    function mouseUp(e) {
        moveCrossHairs(e)
        setDragging(false)
    }

    let crosshairsDiv = props.crosshairs
    ? <div style={{ 'left': props.crosshairs.x - crosshairsSize/2, 'top': flipY(props.crosshairs.y) - crosshairsSize/2 }} className='pointer-events-none absolute mix-blend-difference'>
        <CrosshairsImage />
    </div>
    : []
return <div>
    <div style={{width: canvasSize, height: canvasSize}}>
        <div className='rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden' style={{ position: 'absolute' }} onMouseDown={() => setDragging(true)} onMouseMove={mouseMove} onMouseUp={mouseUp} onDoubleClick={e => props.moveCrossHairs(undefined)}>
            {crosshairsDiv}
            <Canvas width={canvasSize} height={canvasSize} shaderInputs={{ iTime: props.time, width: canvasSize, height: canvasSize }} fragmentSource={getSource()} />
        </div>
    </div>
</div>
}
