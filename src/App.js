import { useState } from 'react'
import { Button } from './Button'
import { CanvasPane } from './CanvasPane'
import { Editor, Viewer } from './Editor'
import { Timeline } from './Timeline'
import { Program } from './language'
import { defaultDuration, defaultSource } from './options'
import './app.css'

import LogoImage from './logo.svg'

let initialSource = window.localStorage.getItem('code')
if (!initialSource) {
    initialSource = defaultSource
}

export function App() {
    const [shaderSource, setShaderSource] = useState(initialSource)

    const [hoveredPoint, hoverPoint] = useState(null)
    const [lockedPoint, lockPoint] = useState(null)
    const [hoveredVariable, hoverVariable] = useState(null)
    const [lockedVariable, lockVariable] = useState(null)
    const [hoveredTime, hoverTime] = useState(0)
    const [lockedTime, lockTime] = useState(0)

    const [editing, setEditing] = useState(true)
    const [runningShaderInfo, setRunningShaderInfo] = useState({
        source: shaderSource,
        program: new Program(shaderSource),
        duration: 5.0
    })

    function toggleEditor(e) {
        if (editing) {
            setEditing(false)
            setRunningShaderInfo({
                source: shaderSource,
                program: new Program(shaderSource),
                duration: defaultDuration,
                variable: 'result'
            })
            localStorage.setItem('code', shaderSource)
        } else {
            setEditing(true)
        }
    }
    function editDuration(d) {
        setTime(Math.min(d, time))
        setRunningShaderInfo({
            source: shaderSource,
            program: runningShaderInfo.program,
            duration: d,
            variable: runningShaderInfo.variable
        })
    }

    let codeComponent
    if (editing) {
        codeComponent = <Editor sourceCode={shaderSource}
            toggle={toggleEditor}
            onChange={e => setShaderSource(e.target.value)} />
    } else {
        codeComponent = <Viewer
            shader={runningShaderInfo}
            lockedVariable={lockedVariable}
            time={hoveredTime || lockedTime}
            point={hoveredPoint || lockedPoint}
            hover={hoverVariable}
            lock={lockVariable}
            toggle={toggleEditor}
        />
    }
    return <div>
        <div className='w-full h-20 flex flex-row items-center p-5'>
            <LogoImage />
        </div>
        <div className='flex flex-row px-5'>
            <div className='pr-4 flex flex-col grow'>
                {codeComponent}
                <Button onClick={toggleEditor}>
                    {editing ? 'Run' : 'Edit'}
                </Button>
            </div>
            <div className='flex flex-col'>
                <div style={{ width: 500 }}>
                    <CanvasPane
                        shader={runningShaderInfo}
                        variable={hoveredVariable || lockedVariable || 'result'}
                        time={hoveredTime || lockedTime}
                        hoveredPoint={hoveredPoint}
                        lockedPoint={lockedPoint}
                        hover={hoverPoint}
                        lock={lockPoint} />
                    <Timeline
                        shader={runningShaderInfo}
                        variable={hoveredVariable || lockedVariable || 'result'}
                        hoveredTime={hoveredTime}
                        lockedTime={lockedTime}
                        point={hoveredPoint || lockedPoint}
                        hover={hoverTime}
                        lock={lockTime}
                        editDuration={editDuration} />
                </div>
            </div>
        </div>
    </div>
}
