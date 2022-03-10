import React from 'react'
import { Button } from './Button'
import { CanvasPane } from './CanvasPane'
import { Editor, Viewer } from './Editor'
import { Timeline } from './Timeline'
import { Program } from './compiler'
import { defaultDuration, defaultSource } from './options'
import './app.css'

import LogoImage from './logo.svg'

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
                variable={this.state.runningShaderInfo.variable} />
        }
        return <div>
            <div className='w-full h-20 flex flex-row items-center p-5'>
                <LogoImage />
            </div>
            <div className='flex flex-row px-5'>
                <div className='pr-4 flex-col grow'>
                    {codeComponent}
                    <Button onClick={this.toggleEditor.bind(this)}>
                        {this.state.editing ? 'Run' : 'Edit'}
                    </Button>
                </div>
                <div className='flex flex-col grow'>
                    <div style={{width: 500}}>
                        <CanvasPane shader={this.state.runningShaderInfo}
                            time={this.state.time} crosshairs={this.state.crosshairs}
                            moveCrossHairs={this.selectLocation.bind(this)} />
                        <Timeline crosshairs={this.state.crosshairs}
                            shader={this.state.runningShaderInfo} value={this.state.time}
                            onChange={this.changeTime.bind(this)} editDuration={this.editDuration.bind(this)}/>
                    </div>
                </div>
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
    editDuration(d) {
        this.setState({
            runningShaderInfo: {
                source: this.state.shaderSource,
                program: this.state.runningShaderInfo.program,
                duration: d,
                variable: this.state.runningShaderInfo.variable
            },
        })
    }
    selectVariable(varName) {
        this.setState({
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
