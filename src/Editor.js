import { useState } from 'react'
import { Button } from './Button'
import { variableWidgets } from './editor/variableWidgets'
import CodeMirror from '@uiw/react-codemirror'

export function Editor(props) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    let [dark, setDark] = useState(mq.matches)

    mq.onchange = e => {
        setDark(mq.matches)
    }
    
    function keyPress(e) {
        if (e.metaKey && e.key == 'Enter') {
            props.toggle()
        }
    }
    return <div className={`flex-grow ${props.editable ? '' : 'readonly'}`} style={{ pointerEvents: props.editable ? 'auto' : 'none' }}>
        <CodeMirror
            value={props.sourceCode}
            editable={props.editable}
            extensions={props.editable ? [] : [variableWidgets(props)]}
            fontSize={16}
            height="500px"
            onKeyDown={keyPress}
            theme={dark ? 'dark' : 'light'}
            onChange={props.onChange}
        />
    </div>
}
