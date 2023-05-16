import { nodeType } from './parser'
import builtins from './builtins'

export function evaluate(node, symtab) {
    if (node.type == nodeType.BINOP) {
        switch (node.operation) {
            case '+':
                return evaluate(node.left, symtab) + evaluate(node.right, symtab)
            case '-':
                return evaluate(node.left, symtab) - evaluate(node.right, symtab)
            case '*':
                return evaluate(node.left, symtab) * evaluate(node.right, symtab)
            case '/':
                return evaluate(node.left, symtab) / evaluate(node.right, symtab)
            case '^':
                // The absolute value isn't technically correct, but it's what we want
                // in most cases and prevents errors.
                return Math.pow(Math.abs(evaluate(node.left, symtab)), evaluate(node.right, symtab))
        }
    }
    if (node.type == nodeType.UNOP) {
        if (node.operation == '-') {
            return -1 * evaluate(node.operand, symtab)
        }
    }
    if (node.type == nodeType.NUMBER) {
        return node.value
    }
    if (node.type == nodeType.FUNCTION) {
        if (node.name in builtins) {
            let numericalArguments = node.args.map(a => evaluate(a, symtab))
            let output = builtins[node.name](...numericalArguments)
            return output
        }
        console.log(`Unknown function name ${node.name}`)
        return 0
    }
    if (node.type == nodeType.IDENTIFIER) {
        if (node.text in symtab) {
            return symtab[node.text]
        }
        console.log(`Unknown variable ${node.text}`)
        return 0
    }
    console.log(`Unrecognized node of type ${node.type}`)
}
