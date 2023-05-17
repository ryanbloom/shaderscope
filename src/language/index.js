import { tokenize } from './lexer'
import { parse, nodeType, nodeTypeNames, lineNumberFor } from './parser'
import { evaluate } from './evaluate'
import { builtins, predefinedVariables } from './builtins'
import { canvasSize, nameLiteral } from '../options'

export class UnknownIdentifierError extends Error {
    constructor(node) {
        super(`Undefined ${nodeTypeNames[node.type]} "${node.name}"`)
        this.node = node
    }
    description(code) {
        return this.message + ` (line ${lineNumberFor(code, this.node.start)})`
    }
}

function validateNode(node, known) {
    switch (node.type) {
        case nodeType.BINOP:
            validateNode(node.left, known)
            validateNode(node.right, known)
            break
        case nodeType.UNOP:
            validateNode(node.operand, known)
            break
        case nodeType.IDENTIFIER:
            if (!known.has(node.name)) {
                throw new UnknownIdentifierError(node)
            }
            break
        case nodeType.FUNCTION:
            if (!(node.name in builtins)) {
                throw new UnknownIdentifierError(node)
            }
            for (let arg of node.args) {
                validateNode(arg, known)
            }
            break
    }
}

export function filterChildren(node, type) {
    if (Array.isArray(node)) {
        return node.map(child => filterChildren(child, type)).flat()
    }
    switch (node.type) {
        case nodeType.ASSIGNMENT:
            return filterChildren(node.value, type)
        case nodeType.BINOP:
            return filterChildren(node.left, type).concat(filterChildren(node.right, type))
        case nodeType.UNOP:
            return filterChildren(node.operand, type)
        case nodeType.FUNCTION:
            return node.args.map(arg => filterChildren(arg, type)).flat()
        default:
            return node.type == type ? [node] : []
    }
}

export class Program {
    constructor(source) {
        if (source[source.length - 1] != '\n') {
            source += '\n'
        }
        this.source = source
        const tokens = tokenize(source)
        this.ast = parse(tokens) // Could throw ParseError
    }

    validate() {
        const known = new Set(predefinedVariables)
        for (let statement of this.ast) {
            if (statement.type == nodeType.ASSIGNMENT) {
                validateNode(statement.value, known)
                known.add(statement.identifier.name)
            }
        }
    }

    getLiteralValues() {
        const literals = {}
        const children = filterChildren(this.ast, nodeType.NUMBER)
        for (const [index, literal] of children.entries()) {
            literals[`_literal${index}`] = literal.value
        }
        return literals
    }

    evaluateVariables(time, coord) {
        if (!coord) {
            return null
        }
        const symbols = {
            t: time,
            x: coord.x,
            y: coord.y,
            width: canvasSize,
            height: canvasSize,
            pi: Math.PI,
            tau: 2 * Math.PI
        }
        for (let statement of this.ast) {
            if (statement.type == nodeType.ASSIGNMENT) {
                symbols[statement.identifier.name] = evaluate(statement.value, symbols)
            }
        }
        return symbols
    }

    compileInner(output, initializers) {
        if (!output) {
            output = 'result'
        }
        const known = new Set(predefinedVariables)
        const lines = this.ast.map(statement => {
            if (statement.type == nodeType.ASSIGNMENT) {
                if (known.has(statement.identifier.name)) {
                    return this.printGLSL(statement) + ';'
                } else {
                    known.has(statement.identifier.name)
                    return `float ${statement.identifier.name} = ${this.printGLSL(statement.value)};`
                }
            }
            return ''
        })

        const literalDeclarations = filterChildren(this.ast, nodeType.NUMBER)
            .map((_, i) => `uniform float ${nameLiteral(i)};`)
            .join('\n')

        const glCode = `precision mediump float;
        uniform float iTime;
        uniform float fixedX;
        uniform float fixedY;
        uniform float width;
        uniform float height;

        ${literalDeclarations}

        float pi = ${Math.PI};
        float tau = ${2 * Math.PI};
        
        void main(void) {
            ${initializers}
            float red = 0.0;
            float green = 0.0;
            float blue = 0.0;
            ${lines.join('\n')}
            ${output == 'result'
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
                return nameLiteral(node.index)
            default:
                return this.source.slice(node.start, node.end)
        }
    }

}
