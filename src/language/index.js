import { tokenize } from './lexer'
import { parse, nodeType } from './parser'
import { evaluate } from './evaluate'
import { canvasSize } from '../options'

export class Program {
    constructor(source) {
        if (source[source.length - 1] != '\n') {
            source += '\n'
        }
        this.source = source
        const tokens = tokenize(source)
        this.ast = parse(tokens) // Could throw ParseError
    }

    spans(time, coord) {
        let symbols = null
        if (coord) {
            symbols = {
                t: time,
                x: coord.x,
                y: coord.y,
                width: canvasSize,
                height: canvasSize,
                pi: Math.PI,
                tau: 2*Math.PI
            }
        }
        let results = []
        for (let statement of this.ast) {
            if (statement.type == nodeType.ASSIGNMENT) {
                let val = symbols ? evaluate(statement.value, symbols) : null
                let line = []
                line.push({
                    type: 'variable',
                    text: this.source.slice(statement.identifier.start, statement.identifier.end),
                    value: val
                })
                line.push({
                    type: 'default',
                    text: this.source.slice(statement.identifier.end, statement.end)
                })
                line.push({
                    type: 'value',
                    value: val
                })
                results.push(line)
                if (symbols) {
                    symbols[statement.identifier.text] = val
                }
            }
        }
        return results
    }
    
    compileInner(output, initializers) {
        if (!output) {
            output = 'result'
        }
        let known = ['iTime', 'fixedX', 'fixedY', 'iResolution', 't', 'x', 'y', 'red', 'green', 'blue', 'width', 'height', 'pi', 'tau']
        const lines = this.ast.map(statement => {
            if (statement.type == nodeType.ASSIGNMENT) {
                if (known.includes(statement.identifier.text)) {
                    return this.printGLSL(statement) + ';'
                } else {
                    known.push(statement.identifier.text)
                    return 'float ' + statement.identifier.text + ' = ' + this.printGLSL(statement.value) + ';'
                }
            }
            return ''
        })
    
        const glCode = `precision mediump float;
        uniform float iTime;
        uniform float fixedX;
        uniform float fixedY;
        uniform float width;
        uniform float height;

        float pi = 3.1415926535;
        float tau = 6.2831853072;
        
        void main(void) {
            ${initializers}
            float red = 0.0;
            float green = 0.0;
            float blue = 0.0;
            ${lines.join('\n')}
            ${
                output == 'result'
                ? 'gl_FragColor = vec4(red, green, blue, 1.0);'
                : `gl_FragColor = vec4(${output}, ${output}, ${output}, 1.0);`
            }
        }`
        return glCode
    }
    
    compileTimeline(output, scale) {
        let initializers = `float x = fixedX;
        float y = fixedY;
        float t = gl_FragCoord.x * ${scale};`
        return this.compileInner(output, initializers)
    }
    
    compile(output) {
        let initializers = `float x = gl_FragCoord.x;
        float y = gl_FragCoord.y;
        float t = iTime;`
        return this.compileInner(output, initializers)
    }

    printGLSL(node) {
        switch (node.type) {
            case nodeType.ASSIGNMENT:
                return this.printGLSL(node.identifier) + ' = ' + this.printGLSL(node.value)
            case nodeType.BINOP:
                if (node.operation == '^') {
                    return `pow(${this.printGLSL(node.left)}, ${this.printGLSL(node.right)})`
                }
                return '(' + this.printGLSL(node.left) + node.operation + this.printGLSL(node.right) + ')'
            case nodeType.UNOP:
                return '(' + node.operation + this.printGLSL(node.operand) + ')'
            case nodeType.FUNCTION:
                return node.name + '(' + node.args.map(this.printGLSL.bind(this)).join(',') + ')'
            case nodeType.NUMBER:
                return node.value.toFixed(8)
            default:
                return this.source.slice(node.start, node.end)
        }
    }
    
}
