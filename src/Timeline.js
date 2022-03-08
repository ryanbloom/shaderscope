import React from 'react'

import { Canvas } from './Canvas'
import { canvasSize } from './options'

const width = 300

export class Timeline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dragging: false,
            playing: false
        }
    }
    render() {
        let backgroundColoring = this.props.crosshairs
            ? <Canvas width={width} height='50' fragmentSource={this.getShader()}
            shaderInputs={{fixedX: this.props.crosshairs.x, fixedY: this.props.crosshairs.y, width: canvasSize, height: canvasSize}}/>
            : []
        return <div className='mt-2'>
            <button onClick={this.playPause.bind(this)}>{this.state.playing ? '⏸' : '▶️'}</button>
            <div className='timecode'>{this.timecode()}</div>
            <div style={{ position: 'absolute', height: 50, width: width, backgroundColor: '#ddd' }} onMouseDown={this.mouseDown.bind(this)}
                onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)}>
                <div style={{left: this.xForTime(this.props.value)}}
                    className='pointer-events-none w-1 h-full bg-red-600 absolute'></div>
                {backgroundColoring}
            </div>
        </div>
    }

    timecode() {
        let minutes = Math.floor(this.props.value / 60)
        let seconds = Math.floor(this.props.value % 60)
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
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
        return this.props.shader.program.compileTimeline(this.props.shader.variable, this.props.shader.duration)
    }

    xForTime(t) {
        return t/this.props.shader.duration*width
    }

    timeForX(x) {
        return x/width*this.props.shader.duration
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
}
