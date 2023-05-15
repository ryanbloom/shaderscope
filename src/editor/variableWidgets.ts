import { Extension, RangeSetBuilder } from '@codemirror/state'
import { EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate, WidgetType } from '@codemirror/view'

class VarWidget extends WidgetType {
    name: string
    handlers: any
    active: boolean = false

    constructor(name: string, handlers: any, active: boolean = false) {
        super()
        this.name = name
        this.handlers = handlers
        this.active = active
    }

    toDOM(view: EditorView) {
        let span = document.createElement('span')
        if (this.active) {
            span.className = 'span-var span-var-active'
            span.style.backgroundColor = 'var(--span-var-active-bg)'
        } else {
            span.className = 'span-var'
        }
        span.innerText = this.name
        span.onmousedown = e => { this.handlers.lock(this.active ? null : this.name) }
        span.onmouseenter = e => { this.handlers.hover(this.name) }
        span.onmouseleave = e => { this.handlers.hover(null) }
        span.style.pointerEvents = 'auto'
        return span
    }
}

class ValueWidget extends WidgetType {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    toDOM(view: EditorView) {
        let span = document.createElement('span')
        span.className = 'span-value'
        span.innerText = this.value.toFixed(2)
        return span
    }
}

function decorate(view: EditorView, values: any, selected: string, handler: (name: string) => void) {
    const builder = new RangeSetBuilder<Decoration>()
    for (let { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to;) {
            let line = view.state.doc.lineAt(pos)
            if (line.text.includes('=')) {
                const varName = line.text.split('=')[0].trimEnd()
                let varDecoration = Decoration.replace({
                    widget: new VarWidget(varName, handler, varName === selected)
                })
                builder.add(line.from, line.from + varName.length, varDecoration)
                
                if (values && varName in values) {
                    let valueDecoration = Decoration.widget({
                        widget: new ValueWidget(values[varName])
                    })
                    builder.add(line.to, line.to, valueDecoration)
                }
            }
            pos = line.to + 1
        }
    }
    return builder.finish()
}

export function variableWidgets(values, selection, handlers): Extension {
    const plugin = ViewPlugin.fromClass(
        class {
            decorations: DecorationSet
            constructor(view: EditorView) {
                this.decorations = decorate(view, values, selection, handlers)
            }

            update(update: ViewUpdate) {
                this.decorations = decorate(update.view, values, selection, handlers)
            }
        },
        {
            decorations: v => v.decorations,
        },
    )
    return [plugin]
}
