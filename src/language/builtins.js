function clamp(x, lo, hi) {
    if (x < lo) {
        return lo
    }
    if (x > hi) {
        return hi
    }
    return x
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)
}

function step(edge, x) {
    return x > edge ? 1 : 0
}

function mix(x, y, a) {
    return x * (1 - a) + y * a
}

export const predefinedVariables = [
    't',
    'x', 
    'y',
    'red',
    'green',
    'blue',
    'width',
    'height',
    'pi',
    'tau'
]

export const builtins = {
    'sin': Math.sin,
    'cos': Math.cos,
    'tan': Math.tan,
    'atan': Math.atan,
    'abs': Math.abs,
    'sqrt': Math.sqrt,
    'exp': Math.exp,
    'clamp': clamp,
    'smoothstep': smoothstep,
    'step': step,
    'min': Math.min,
    'max': Math.max,
    'mix': mix
}
