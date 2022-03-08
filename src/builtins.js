function clamp(x, lo, hi) {
    return Math.max(Math.min(x, hi), lo)
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)
}

export default builtins = {
    'sin': Math.sin,
    'cos': Math.cos,
    'sqrt': Math.sqrt,
    'exp': Math.exp,
    'clamp': clamp,
    'smoothstep': smoothstep
}
