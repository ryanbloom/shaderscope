import React from 'react'
import { Canvas } from './Canvas'
import { canvasSize } from './options'

export class CanvasPane extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dragging: false
        }
    }
    render() {
        let crosshairsButton = this.props.crosshairs
            ? <button onClick={this.deselectCrosshairs.bind(this)}>Hide crosshairs</button>
            : []
        let crosshairsDiv = this.props.crosshairs
            ? <div style={{ 'left': this.props.crosshairs.x + 'px', 'top': this.flipY(this.props.crosshairs.y) + 'px' }} className='pointer-events-none text-black absolute'>x</div>
            : []
        return <div>
            <div style={{width: canvasSize, height: canvasSize}}>
                <div style={{ position: 'absolute' }} onMouseDown={this.mouseDown.bind(this)} onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)}>
                    {crosshairsDiv}
                    <Canvas width={canvasSize} height={canvasSize} shaderInputs={{ iTime: this.props.time, width: canvasSize, height: canvasSize }} fragmentSource={this.getSource()} />
                </div>
            </div>
            {crosshairsButton}
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
    deselectCrosshairs() {
        this.props.moveCrossHairs(undefined)
    }
}
