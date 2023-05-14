import { Button } from './Button'

export function Editor(props) {
    function keyPress(e) {
        if (e.metaKey && e.key == 'Enter') {
            props.toggle()
        }
    }
    return <div className='flex-grow'>
        <textarea onKeyDown={keyPress}
        value={props.sourceCode}
        className='w-full h-full'
        onChange={props.onChange} />
    </div>
}

export function Viewer(props) {
    let spanEls = props.shader.program.spans(props.time, props.coord).map((line, idx) => {
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
                let cn = props.variable == span.text
                    ? 'span-variable span-variable-active'
                    : 'span-variable'
                return <span key={idx2} className={cn}
                    onClick={_ => props.onSelect(span.text)}>
                    {span.text}
                </span>
            }
            return <span key={idx2} className={'span-' + span.type} onClick={props.toggle}>
                {span.text}
            </span>
        })
        return <div key={idx} className='flex flex-row my-0.5'>{ch}</div>
    })
    let btn = props.variable == 'result'
        ? []
        : <Button onClick={_ => props.onSelect('result')}>Show result</Button>
    return <div>
        <pre>
            <code>
                {spanEls}
            </code>
        </pre>
        {btn}
    </div>
}
