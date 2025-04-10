# Shaderscope

Shaderscope is an interface for making animations with fragment shaders. It's largely inspired by [Shadertoy](https://shadertoy.com) and [smoothstep.io](https://smoothstep.io), but puts a special emphasis on *visualizing as much as possible*.

Shaderscope provides three different views of your program. The code shows different variables, the canvas shows different pixels in space, and the timeline shows different frames in time. You can constrain any two of these to see how the third varies. For instance, if you select a variable and a pixel, the timeline will show how that variable changes in that pixel over the course of the animation.

## Language

Shadercope uses an extremely simplified language that transpiles to GLSL. Right now, it's basically just mathematical expressions and floating-point variables. The program takes `x`, `y`, and `t` (time) as input. Output is in the form of the `red`, `green`, and `blue` variables, which specify the pixel's color. Here's an example of a Shaderscope program:

```
edgeSize = 0.01
rRadius = 0.5 + 0.3*sin(t)
gRadius = 0.5 + 0.3*sin(t+tau/3)
bRadius = 0.5 + 0.3*sin(t+2*tau/3)
u = x/width*2 - 1
v = y/height*2 - 1
r = sqrt(u*u + v*v)
red = 1-smoothstep(rRadius, rRadius+edgeSize, r)
green = 1-smoothstep(gRadius, gRadius+edgeSize, r)
blue = 1-smoothstep(bRadius, bRadius+edgeSize, r)
```

## Development
```
git clone https://github.com/ryanbloom/shaderscope.git
cd shaderscope
npm install
npx parcel src/index.html
```
