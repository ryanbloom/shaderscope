import React from 'react'
import { CanvasPane } from './CanvasPane'
import { Editor, Viewer } from './Editor'
import { Timeline } from './Timeline'
import { Program } from './compiler'
import './app.css'

let defaultSource = 'red = 1.0'
let defaultDuration = 5.0

export class App extends React.Component {
    constructor(props) {
        super(props)
        let code = window.localStorage.getItem('code')
        if (!code) {
            code = defaultSource
        }
        this.state = {
            shaderSource: code,
            runningShaderInfo: {
                source: code,
                program: new Program(code),
                variable: 'result',
                duration: 5.0
            },
            time: 0,
            editing: true,
            crosshairs: undefined
        }
    }
    render() {
        let codeComponent
        if (this.state.editing) {
            codeComponent = <Editor sourceCode={this.state.shaderSource}
                toggle={this.toggleEditor.bind(this)}
                onChange={this.handleEdit.bind(this)} />
        } else {
            codeComponent = <Viewer shader={this.state.runningShaderInfo}
                onSelect={this.selectVariable.bind(this)}
                time={this.state.time} coord={this.state.crosshairs}
                variable={this.state.selectedVariable} />
        }
        return <div className='flex flex-row'>
            <div className='pr-4 flex-col grow'>
                {codeComponent}
                <button onClick={this.toggleEditor.bind(this)}>
                    {this.state.editing ? 'Run' : 'Edit'}
                </button>
            </div>
            <div className='flex flex-col grow'>
                <CanvasPane shader={this.state.runningShaderInfo}
                    time={this.state.time} crosshairs={this.state.crosshairs}
                    moveCrossHairs={this.selectLocation.bind(this)} />
                <Timeline crosshairs={this.state.crosshairs}
                    shader={this.state.runningShaderInfo} value={this.state.time}
                    onChange={this.changeTime.bind(this)} />
            </div>
        </div>
    }
    handleEdit(e) {
        this.setState({
            shaderSource: e.target.value
        })
    }
    toggleEditor(e) {
        if (this.state.editing) {
            this.setState({
                editing: false,
                runningShaderInfo: {
                    source: this.state.shaderSource,
                    program: new Program(this.state.shaderSource),
                    duration: defaultDuration,
                    variable: 'result'
                }
            })
            localStorage.setItem('code', this.state.shaderSource)
        } else {
            this.setState({
                editing: true
            })
        }
    }
    changeTime(t) {
        this.setState({
            time: t
        })
    }
    selectVariable(varName) {
        this.setState({
            selectedVariable: varName,
            runningShaderInfo: {
                source: this.state.shaderSource,
                program: this.state.runningShaderInfo.program,
                duration: this.state.runningShaderInfo.duration,
                variable: varName
            },
        })
    }
    selectLocation(p) {
        this.setState({
            crosshairs: p
        })
    }
}
