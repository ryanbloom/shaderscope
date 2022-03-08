import React from 'react'

export class Editor extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <div>
            <textarea onKeyDown={this.keyPress.bind(this)}
            rows={10} cols={30} value={this.props.sourceCode}
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
                        return <span key={idx2} className='span-value grow'>
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
                return <span key={idx2} className={'span-' + span.type}>
                    {span.text}
                </span>
            })
            return <div key={idx} className='flex flex-row my-1'>{ch}</div>
        })
        let btn = this.props.variable == 'result'
            ? []
            : <button onClick={_ => this.props.onSelect('result')}>Show result</button>
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
