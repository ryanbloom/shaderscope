export const tokenType = {
    IDENTIFIER: 0,
    NUMBER: 1,
    PUNCTUATION: 2,
    NEWLINE: 3
}

class Token {
    constructor(type, text, start, end) {
        this.type = type
        this.text = text
        this.start = start
        this.end = end
    }
}

function isAlpha(c) {
    let code = c.charCodeAt(0)
    return (code > 64 && code < 91) /* upper */ || (code > 96 && code < 123) /* lower */
}

function isNum(c) {
    let code = c.charCodeAt(0)
    return (code >= 48) && (code <= 57)
}

export function tokenize(code) {
    let start = 0
    let current = 0
    let tokens = []

    function addToken(type) {
        tokens.push(new Token(type, code.slice(start, current), start, current))
    }

    while (current < code.length) {
        let c = code[current]
        start = current

        if (c == '/' && current +1 < code.length && code[current+1] == '/') {
            // Comment
            while (code[current] != '\n') {
                current += 1
            }
        } else if (['(', ')', '+', '-', '*', '/', '^', '=', ','].includes(c)) {
            current++
            addToken(tokenType.PUNCTUATION)
        } else if (isAlpha(c)) {
            while (isAlpha(code[current])) {
                current++
            }
            addToken(tokenType.IDENTIFIER)
        } else if (isNum(c)) {
            while (isNum(code[current]) || code[current] == '.') {
                current++
            }
            addToken(tokenType.NUMBER)
        } else if (c == '\n') {
            current++
            addToken(tokenType.NEWLINE)
        } else if (c == ' ') {
            current++
            // Whitespace, do nothing
        } else {
            console.log(`Unrecognized character ${c}`)
            current++
        }
    }
    return tokens
}

