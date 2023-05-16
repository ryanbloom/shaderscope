import { Extension, RangeSetBuilder } from '@codemirror/state'
import { EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate, WidgetType } from '@codemirror/view'
import { Program, filterChildren } from '../language'
import { nodeType } from '../language/parser'
import { draggingSpeed } from '../options'

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
        const span = document.createElement('span')
        if (this.active) {
            span.className = 'span-var span-var-active'
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
        const span = document.createElement('span')
        span.className = 'span-value'
        span.innerText = this.value.toFixed(2)
        return span
    }
}

class LiteralWidget extends WidgetType {
    value: number
    start: number
    end: number
    handler: any
    dragging: boolean = false

    constructor(value: number, start: number, end: number, recompileHandler: any) {
        super()
        this.value = value
        this.start = start
        this.end = end
        this.handler = recompileHandler
    }

    toDOM(view: EditorView) {
        const span = document.createElement('span')
        span.className = 'span-literal'
        span.innerText = this.value.toFixed(2)
        span.onmousedown = e => {
            span.requestPointerLock()
            this.dragging = true
        }
        span.onmouseup = e => {
            document.exitPointerLock()
            this.dragging = false
            view.dispatch({
                changes: {
                    from: this.start,
                    to: this.end,
                    insert: this.value.toFixed(2)
                }
            })
            this.handler(view.state.doc.toString())
        }
        span.onmousemove = e => {
            if (e.buttons && this.dragging) {
                this.value += e.movementX / view.defaultCharacterWidth * draggingSpeed
                span.innerText = this.value.toFixed(2)
            }
        }
        return span
    }
}

export function variableWidgets(props): Extension {
    const plugin = ViewPlugin.fromClass(
        class {
            decorations: DecorationSet
            constructor(view: EditorView) {
                this.decorate(view, props)
            }

            update(update: ViewUpdate) {
                this.decorate(update.view, props)
            }

            decorate(view: EditorView, props: any) {
                const builder = new RangeSetBuilder<Decoration>()
                const text = view.state.doc.toString()
                const values = props.shader.program.evaluateVariables(props.time, props.point)
                try {
                    const program = new Program(text)

                    for (const statement of program.ast) {
                        const line = text.slice(statement.start, statement.end)

                        // Variable widget
                        const varName = line.split('=')[0].trimEnd()
                        let varDecoration = Decoration.replace({
                            widget: new VarWidget(
                                varName,
                                { lock: props.lock, hover: props.hover },
                                varName === props.lockedVariable
                            )
                        })
                        builder.add(statement.start, statement.start + varName.length, varDecoration)

                        // Literal widgets
                        const literals = filterChildren(statement, nodeType.NUMBER)
                        for (const literal of literals) {
                            const literalDecoration = Decoration.widget({
                                widget: new LiteralWidget(literal.value, literal.start, literal.end, props.onChange)
                            })
                            builder.add(literal.start, literal.end, literalDecoration)
                        }

                        // Value widget
                        if (values && varName in values) {
                            let valueDecoration = Decoration.widget({
                                widget: new ValueWidget(values[varName])
                            })
                            builder.add(statement.end, statement.end, valueDecoration)
                        }
                    }
                } catch (e) {
                    console.log(e)
                }

                this.decorations = builder.finish()
            }
        },
        {
            decorations: v => v.decorations,
        },
    )
    return [plugin]
}
