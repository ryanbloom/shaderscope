export const canvasSize = 500
export const crosshairsSize = 24
export const timelineHeight = 14
export const playheadHeight = 30
export const defaultDuration = 5.0
export const defaultSource = `rRadius = 0.5 + 0.3*sin(t)
gRadius = 0.5 + 0.3*sin(t+tau/3)
bRadius = 0.5 + 0.3*sin(t+2*tau/3)
edgeSize = 0.01
u = x/width*2 - 1
v = y/height*2 - 1
r = sqrt(u^2 + v^2)
red = 1-smoothstep(rRadius, rRadius+edgeSize, r)
green = 1-smoothstep(gRadius, gRadius+edgeSize, r)
blue = 1-smoothstep(bRadius, bRadius+edgeSize, r)`
