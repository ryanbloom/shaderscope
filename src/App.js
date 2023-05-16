import { useState, useRef } from 'react'
import { Button, MenuLink } from './Button'
import { CanvasPane } from './CanvasPane'
import { Editor } from './Editor'
import { Timeline } from './Timeline'
import { Program, UnknownIdentifierError } from './language'
import { defaultDuration, defaultSource } from './options'
import './app.css'

import LogoImage from './logo.svg'
import { ParseError } from './language/parser'

let initialSource = window.localStorage.getItem('code')
if (!initialSource) {
    initialSource = defaultSource
}

let initialProgram
try {
    initialProgram = new Program(initialSource)
    initialProgram.validate()
} catch (e) {
    initialSource = defaultSource
    initialProgram = new Program(initialSource)
}

export function App() {
    const [shaderSource, setShaderSource] = useState(initialSource)

    const [hoveredPoint, hoverPoint] = useState(null)
    const [lockedPoint, lockPoint] = useState(null)
    const [hoveredVariable, hoverVariable] = useState(null)
    const [lockedVariable, lockVariable] = useState(null)
    const [hoveredTime, hoverTime] = useState(0)
    const [lockedTime, lockTime] = useState(0)
    const [error, setError] = useState(null)

    // Bit of a hack: when the cursor moves from one variable to another,
    // it sends a mouseenter and mouseleave at the same time. We wait to
    // see if this is happening and ignore the mouseleave so the new
    // variable is displayed correctly.
    const hoverOut = useRef()
    function debouncedHover(varName) {
        if (!varName) {
            hoverOut.current = true
            setTimeout(() => {
                if (hoverOut.current) {
                    hoverVariable(null)
                }
            }, 0)
        } else {
            hoverOut.current = false
            hoverVariable(varName)
        }
    }

    const [editing, setEditing] = useState(true)
    const [runningShaderInfo, setRunningShaderInfo] = useState({
        source: initialSource,
        program: initialProgram,
        duration: 5.0
    })

    function run(source) {
        try {
            const program = new Program(source)
            program.validate()
            setRunningShaderInfo({
                source: source,
                program: program,
                duration: defaultDuration,
                variable: 'result'
            })
            setError(null)
            localStorage.setItem('code', source)
        } catch (err) {
            if (err instanceof ParseError) {
                setError(err)
            } else if (err instanceof UnknownIdentifierError) {
                setError(err)
            }
        }
    }

    function toggleEditor(e) {
        if (editing) {
            setEditing(false)
            run()
        } else {
            setEditing(true)
        }
    }

    function editDuration(d) {
        lockTime(Math.min(d, lockedTime))
        setRunningShaderInfo({
            source: shaderSource,
            program: runningShaderInfo.program,
            duration: d,
            variable: runningShaderInfo.variable
        })
    }

    function changeHandler(s) {
        if (!editing) {
            run(s)
        }
        setShaderSource(s)
    }

    return <div>
        <div className='w-full h-20 flex flex-row items-center p-5'>
            <LogoImage />
            <div className='flex flex-grow justify-end'>
                <MenuLink href='https://github.com/ryanbloom/shaderscope'>
                    GitHub
                </MenuLink>
            </div>
        </div>
        <div className='flex flex-row px-5'>
            <div className='pr-4 flex flex-col grow'>
                <Editor sourceCode={shaderSource}
                    editable={editing}
                    shader={runningShaderInfo}
                    lockedVariable={lockedVariable}
                    time={hoveredTime || lockedTime}
                    point={hoveredPoint || lockedPoint}
                    hover={debouncedHover}
                    lock={lockVariable}
                    toggle={toggleEditor}
                    error={error}
                    onChange={changeHandler} />
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
                        lock={lockPoint}
                        error={error} />
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
