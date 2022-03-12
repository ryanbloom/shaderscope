import React from 'react'
import { Canvas } from './Canvas'
import { canvasSize, crosshairsSize } from './options'
import CrosshairsImage from './crosshairs-small.svg'
import { Button } from './Button'
export class CanvasPane extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dragging: false
        }
    }
    render() {
        let crosshairsDiv = this.props.crosshairs
            ? <div style={{ 'left': this.props.crosshairs.x - crosshairsSize/2, 'top': this.flipY(this.props.crosshairs.y) - crosshairsSize/2 }} className='pointer-events-none absolute mix-blend-difference'>
                <CrosshairsImage />
            </div>
            : []
        return <div>
            <div style={{width: canvasSize, height: canvasSize}}>
                <div className='rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden' style={{ position: 'absolute' }} onMouseDown={this.mouseDown.bind(this)} onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)} onDoubleClick={e => this.props.moveCrossHairs(undefined)}>
                    {crosshairsDiv}
                    <Canvas width={canvasSize} height={canvasSize} shaderInputs={{ iTime: this.props.time, width: canvasSize, height: canvasSize }} fragmentSource={this.getSource()} />
                </div>
            </div>
        </div>
    }

    getSource() {
        let glCode = this.props.shader.program.compile(this.props.shader.variable)
        return glCode
    }
    flipY(y) {
        return canvasSize - y
    }
    mouseDown(e) {
        this.setState({
            dragging: true
        })
    }
    mouseMove(e) {
        if (this.state.dragging) {
            this.moveCrossHairs(e)
        }
    }
    mouseUp(e) {
        this.moveCrossHairs(e)
        this.setState({
            dragging: false
        })
    }
    moveCrossHairs(e) {
        const r = e.target.getBoundingClientRect()
        this.props.moveCrossHairs({
            x: e.clientX - r.left,
            y: r.top + r.height - e.clientY
        })
    }
}
