import { useState } from 'react'
import { Canvas } from './Canvas'
import { canvasSize, crosshairsSize } from './options'
import CrosshairsImage from './crosshairs-small.svg'

export function CanvasPane(props) {
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
    
    let errorDiv = props.error
    ? <div className='code error absolute p-4 text-white bg-black/80 w-full h-full'>
            {props.error.description(props.shader.source)}
        </div>
        : []
        
        let crosshairsDiv = props.lockedPoint
        ? <div style={{ 'left': props.lockedPoint.x - crosshairsSize / 2, 'top': flipY(props.lockedPoint.y) - crosshairsSize / 2 }}
        className='pointer-events-none absolute mix-blend-difference'>
            <CrosshairsImage />
        </div>
        : []
        
    const source = props.shader.program.compile(props.variable)
    const inputs = {
        iTime: props.time,
        width: canvasSize,
        height: canvasSize,
        ...props.shader.literals
    }

    return <div>
        <div style={{ width: canvasSize, height: canvasSize }}>

            <div className='rounded-md outline outline-2 outline-slate-200 dark:outline-slate-600 overflow-hidden'
                style={{ position: 'absolute' }}
                onMouseDown={moveCrossHairs}
                onMouseMove={moveCrossHairs}
                onMouseOut={() => props.hover(null)}
                onDoubleClick={() => props.lock(null)}>
                {errorDiv}
                {crosshairsDiv}
                <Canvas
                    width={canvasSize}
                    height={canvasSize}
                    shaderInputs={inputs}
                    fragmentSource={source} />
            </div>
        </div>
    </div>
}
