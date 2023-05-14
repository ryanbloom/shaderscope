import { useEffect, useRef, useState } from 'react'
import { PlayArrowRounded, PauseRounded } from '@mui/icons-material'
import { Button } from './Button'

import { Canvas } from './Canvas'
import { canvasSize, timelineHeight, playheadHeight, defaultDuration } from './options'

export function Timeline(props) {
    const timelineContainerRef = useRef()
    const [playing, setPlaying] = useState(false)
    const [pendingDuration, setPendingDuration] = useState(String(defaultDuration))
    const [editingDuration, setEditingDuration] = useState(false)
    const [timelineCanvasWidth, setTimelineCanvasWidth] = useState(300)

    const animationFrame = useRef()
    const lastRender = useRef()
    const valueProp = useRef(0)
    valueProp.current = props.lockedTime
    const playingRef = useRef(false)

    useEffect(() => {
        const bounds = timelineContainerRef.current.getBoundingClientRect()
        if (bounds.width != timelineCanvasWidth) {
            setTimelineCanvasWidth(bounds.width)
        }
    }, [])

    function timecode() {
        return String(Math.floor(props.lockedTime))
    }

    function play() {
        setPlaying(true)
        lastRender.current = Date.now()
        animationFrame.current = requestAnimationFrame(step)
    }

    function pause() {
        setPlaying(false)
        cancelAnimationFrame(animationFrame.current)
    }

    function playPause() {
        if (!playing) {
            play()
        } else {
            pause()
        }
    }

    function step() {
        let now = Date.now()
        const delta = (now - lastRender.current) / 1000
        const newval = (valueProp.current + delta) % props.shader.duration
        valueProp.current = newval
        lastRender.current = now
        props.lock(newval)
        animationFrame.current = requestAnimationFrame(step)
    }

    function getShader() {
        return props.shader.program.compileTimeline(props.variable, props.shader.duration / timelineCanvasWidth)
    }

    function xForTime(t) {
        return t / props.shader.duration * timelineCanvasWidth
    }

    function timeForX(x) {
        return x / timelineCanvasWidth * props.shader.duration
    }

    function changeTime(e) {
        if (playing) {
            if (e.buttons) {
                pause()
            } else {
                return // Disable hover updates when playing
            }
        }
        const t = timeForX(e.clientX - e.target.getBoundingClientRect().left)
        props.hover(t)
        if (e.buttons) {
            props.lock(t)
        }
    }

    function editDuration(e) {
        setEditingDuration(true)
        setPendingDuration(e.target.value)
    }

    function changeDuration(e) {
        setEditingDuration(false)
        let duration = Number(pendingDuration)
        if (!duration || duration < 0) {
            duration = 1
        }
        props.editDuration(duration)
    }

    let backgroundColoring = props.point
        ? <Canvas className='border border-slate-200 dark:border-slate-600 rounded-md'
            width={timelineCanvasWidth} height={timelineHeight} fragmentSource={getShader()}
            shaderInputs={{ fixedX: props.point.x, fixedY: props.point.y, width: canvasSize, height: canvasSize }} />
        : []
    let backgroundContainer = <div className='w-full rounded-md overflow-hidden bg-slate-200 dark:bg-slate-600'
        style={{ height: timelineHeight + 2 /* for the border */ }} ref={timelineContainerRef}>
        {backgroundColoring}
    </div>
    let playPauseIcon = playing ? <PauseRounded /> : <PlayArrowRounded />
    return <div className='flex flex-row items-center'>
        <Button onClick={playPause}>
            {playPauseIcon}
        </Button>

        <div className='code cursor-default text-annotation text-center w-12'>{timecode()}</div>

        <div className='grow flex flex-row items-center'
            style={{ height: 50 }}
            onMouseDown={changeTime}
            onMouseMove={changeTime}
            onMouseOut={() => props.hover(null)}>
            <div style={{ position: 'absolute', width: 0, height: playheadHeight }}>
                <div style={{ left: xForTime(props.lockedTime) }}
                    className='pointer-events-none w-1 rounded h-full bg-black dark:bg-white absolute'>
                </div>
            </div>
            {backgroundContainer}
        </div>

        <input type='text' className='code text-annotation text-center w-12'
            value={editingDuration ? pendingDuration : props.shader.duration}
            onChange={editDuration} onBlur={changeDuration}
            onKeyDown={e => { if (e.key == 'Enter') changeDuration(e) }} />
    </div>
}
