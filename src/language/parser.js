import { tokenType, tokenTypeNames } from './lexer'

export const nodeType = {
    IDENTIFIER: 0,
    NUMBER: 1,
    BINOP: 2,
    ASSIGNMENT: 3,
    FUNCTION: 4,
    UNOP: 5
}

function lineNumberForToken(code, token) {
    let line = 1
    for (let i = 0; i < token.start; i++) {
        if (code[i] == '\n') {
            line++
        }
    }
    return line
}

export class ParseError extends Error {
    constructor(message, token) {
        super(message)
        this.token = token
    }
    description(code) {
        return this.message + ` (token '${this.token.text}' on line ${lineNumberForToken(code, this.token)})`
    }
}

export function parse(tokens) {
    let i = 0
    let literalIndex = 0
    let end = tokens.length

    function token(type, text) {
        if (tokens[i].type != type) {
            if (text) {
                throw new ParseError(`Expected ${tokenTypeNames[type]} "${text}", found ${tokenTypeNames[tokens[i].type]}`, tokens[i])
            } else {
                throw new ParseError(`Expected ${tokenTypeNames[type]}, found ${tokenTypeNames[tokens[i].type]}`, tokens[i])
            }
        }
        if (text && text != tokens[i].text) {
            throw new ParseError(`Expected token with text "${text}", found "${tokens[i]}"`)
        }
        i++
    }

    function identifier() {
        let node = {
            type: nodeType.IDENTIFIER,
            text: tokens[i].text,
            start: tokens[i].start,
            end: tokens[i].end
        }
        i++
        return node
    }

    function match(type, text) {
        if (tokens[i].type == type && tokens[i].text == text) {
            i++
            return true
        }
        return false
    }

    function primary() {
        if (match(tokenType.PUNCTUATION, '(')) {
            let t = sum()
            token(tokenType.PUNCTUATION, ')')
            t.end += 1
            return t
        }
        if (tokens[i].type == tokenType.NUMBER) {
            const t = {
                type: nodeType.NUMBER,
                value: Number(tokens[i].text),
                start: tokens[i].start,
                end: tokens[i].end,
                index: literalIndex
            }
            i += 1
            literalIndex += 1
            return t
        }
        if (tokens[i].type == tokenType.IDENTIFIER && tokens[i + 1].text == '(') {
            // Function call
            let s = tokens[i].start
            let id = tokens[i].text
            i += 2
            let args = []
            args.push(sum())
            while (match(tokenType.PUNCTUATION, ',')) {
                args.push(sum())
            }
            let e = tokens[i].end
            token(tokenType.PUNCTUATION, ')')
            return {
                type: nodeType.FUNCTION,
                name: id,
                args: args,
                start: s,
                end: e
            }
        }
        if (tokens[i].type == tokenType.IDENTIFIER) {
            return identifier()
        }
    }

    function unary() {
        if (match(tokenType.PUNCTUATION, '-')) {
            const operation = tokens[i - 1]
            const operand = unary()
            if (operand.type == nodeType.NUMBER) {
                // Parse as a negative number, rather than the negation of a positive
                // number. This is required for the literal sliders work correctly.
                return {
                    type: nodeType.NUMBER,
                    value: -1 * operand.value,
                    start: operation.start,
                    end: operand.end,
                    index: operand.index
                }
            } else {
                return {
                    type: nodeType.UNOP,
                    operation: operation.text,
                    operand: operand,
                    start: operation.start,
                    end: operand.end
                }
            }
        }
        return primary()
    }

    function matchAny(type, texts) {
        if (tokens[i].type == type && texts.includes(tokens[i].text)) {
            i++
            return true
        }
        return false
    }

    function leftAssociativeBinOpParser(ops, lower) {
        return function () {
            let exp = lower()
            while (matchAny(tokenType.PUNCTUATION, ops)) {
                let op = tokens[i - 1]
                let f2 = lower()
                exp = {
                    type: nodeType.BINOP,
                    operation: op.text,
                    left: exp,
                    right: f2,
                    start: exp.start,
                    end: f2.end
                }
            }
            return exp
        }
    }

    const power = leftAssociativeBinOpParser(['^'], unary)
    const product = leftAssociativeBinOpParser(['*', '/'], power)
    const sum = leftAssociativeBinOpParser(['+', '-'], product)

    function assignment() {
        let id = identifier()
        token(tokenType.PUNCTUATION, '=')
        let expr = sum()
        return {
            type: nodeType.ASSIGNMENT,
            identifier: id,
            value: expr,
            start: id.start,
            end: expr.end
        }
    }

    function program() {
        let statements = []
        while (i < end) {
            if (tokens[i].type == tokenType.NEWLINE) {
                i++
                continue
            }
            statements.push(assignment())
            token(tokenType.NEWLINE)
        }
        return statements
    }

    return program()
}
