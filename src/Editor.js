import React from 'react'
import { Button } from './Button'

export class Editor extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <div className='flex-grow'>
            <textarea onKeyDown={this.keyPress.bind(this)}
            value={this.props.sourceCode}
            className='w-full h-full'
            onChange={this.props.onChange} />
        </div>
    }
    keyPress(e) {
        if (e.metaKey && e.key == 'Enter') {
            this.props.toggle()
        }
    }
}
export class Viewer extends React.Component {
    render() {
        let spanEls = this.props.shader.program.spans(this.props.time, this.props.coord).map((line, idx) => {
            let ch = line.map((span, idx2) => {
                if (span.type == 'value') {
                    if (span.value != null) {
                        return <span key={idx2} className='span-value cursor-default grow'>
                            {span.value.toFixed(2) + '\n'}
                        </span>
                    } else {
                        return <span key={idx2} className='span-value'></span>
                    }
                }
                if (span.type == 'variable') {
                    let cn = this.props.variable == span.text
                        ? 'span-variable span-variable-active'
                        : 'span-variable'
                    return <span key={idx2} className={cn}
                        onClick={_ => this.props.onSelect(span.text)}>
                        {span.text}
                    </span>
                }
                return <span key={idx2} className={'span-' + span.type} onClick={this.props.toggle}>
                    {span.text}
                </span>
            })
            return <div key={idx} className='flex flex-row my-0.5'>{ch}</div>
        })
        let btn = this.props.variable == 'result'
            ? []
            : <Button onClick={_ => this.props.onSelect('result')}>Show result</Button>
        return <div>
            <pre>
                <code>
                    {spanEls}
                </code>
            </pre>
            {btn}
        </div>
    }
}
