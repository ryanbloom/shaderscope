import React from 'react'
import { PlayArrowRounded, PauseRounded } from '@mui/icons-material'
import { Button } from './Button'

import { Canvas } from './Canvas'
import { canvasSize, timelineHeight, playheadHeight, defaultDuration } from './options'

export class Timeline extends React.Component {
    constructor(props) {
        super(props)
        this.timelineContainerRef = React.createRef()
        this.state = {
            dragging: false,
            playing: false,
            pendingDuration: String(defaultDuration),
            editingDuration: false,

            durationString: String(defaultDuration),
            canvasWidth: 300
        }
    }
    render() {
        let backgroundColoring = this.props.crosshairs
            ? <Canvas className='border border-slate-200 dark:border-slate-600 rounded-md'
            width={this.state.canvasWidth} height={timelineHeight}  fragmentSource={this.getShader()}
            shaderInputs={{fixedX: this.props.crosshairs.x, fixedY: this.props.crosshairs.y, width: canvasSize, height: canvasSize}}/>
            : []
        let backgroundContainer = <div className='w-full rounded-md overflow-hidden bg-slate-200 dark:bg-slate-600'
            style={{height: timelineHeight + 2 /* for the border */}} ref={this.timelineContainerRef}>
            {backgroundColoring}
        </div>
        let playPauseIcon = this.state.playing ? <PauseRounded /> : <PlayArrowRounded />
        return <div className='flex flex-row items-center'>
            <Button onClick={this.playPause.bind(this)}>
                {playPauseIcon}
            </Button>

            <div className='code cursor-default text-annotation text-center w-12'>{this.timecode()}</div>

            <div className='grow flex flex-row items-center' style={{ height: 50 }} onMouseDown={this.mouseDown.bind(this)}
                onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)}>
                <div style={{position: 'absolute', width: 0, height: playheadHeight}}>
                    <div style={{left: this.xForTime(this.props.value)}}
                        className='pointer-events-none w-1 rounded h-full bg-black dark:bg-white absolute'>
                    </div>
                </div>
                {backgroundContainer}
            </div>

            <input type='text' className='code text-annotation text-center w-12'
                value={this.state.editingDuration ? this.state.pendingDuration : this.props.shader.duration}
                onChange={this.editDuration.bind(this)} onBlur={this.changeDuration.bind(this)}
                onKeyDown={e => {if (e.key == 'Enter') this.changeDuration(e) }}/>
        </div>
    }

    componentDidMount() {
        const bounds = this.timelineContainerRef.current.getBoundingClientRect()
        if (bounds.width != this.state.width) {
            this.setState({
                canvasWidth: bounds.width
            })
        }
    }

    timecode() {
        return String(Math.floor(this.props.value))
        let minutes = Math.floor(this.props.value / 60)
        let seconds = Math.floor(this.props.value % 60)
        return String(minutes).padStart(1, '0') + ':' + String(seconds).padStart(2, '0')
    }

    playPause() {
        if (this.state.playing) {
            this.setState({
                playing: false
            })
        } else {
            this.setState({
                playing: true,
                lastRender: Date.now()
            })
            requestAnimationFrame(this.step.bind(this))
        }
    }

    step() {
        let now = Date.now()
        let delta = (now - this.state.lastRender)/1000
        this.props.onChange((this.props.value + delta) % this.props.shader.duration)
        this.setState({
            lastRender: now
        })
        if (this.state.playing) {
            requestAnimationFrame(this.step.bind(this))
        }
    }

    getShader() {
        return this.props.shader.program.compileTimeline(this.props.shader.variable, this.props.shader.duration/this.state.canvasWidth)
    }

    xForTime(t) {
        return t/this.props.shader.duration*this.state.canvasWidth
    }

    timeForX(x) {
        return x/this.state.canvasWidth*this.props.shader.duration
    }

    mouseDown(e) {
        this.props.onChange(this.timeForX(e.clientX - e.target.getBoundingClientRect().left))
        this.setState({
            dragging: true
        })
    }

    mouseMove(e) {
        if (this.state.dragging) {
            this.props.onChange(this.timeForX(e.clientX - e.target.getBoundingClientRect().left))
        }
    }

    mouseUp(e) {
        this.setState({
            dragging: false
        })
    }
    editDuration(e) {
        this.setState({
            editingDuration: true,
            pendingDuration: e.target.value
        })
    }
    changeDuration(e) {
        this.setState({
            editingDuration: false
        })
        let duration = Number(this.state.pendingDuration)
        if (!duration || duration < 0) {
            duration = 1
        }
        this.props.editDuration(duration)
    }
}
