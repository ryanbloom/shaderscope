import React from 'react'

let defaultVertSource = `attribute vec3 coordinates;
         
void main(void) {
   gl_Position = vec4(coordinates.x, coordinates.y, 0.0, 1.0);
}`

export class Canvas extends React.Component {
    constructor(props) {
        super(props)
        this.canvasRef = React.createRef()
    }
    render() {
        return <canvas className={this.props.className} width={this.props.width} height={this.props.height} ref={this.canvasRef}>
        </canvas>
    }
    componentDidUpdate() {
        this.renderShader()
    }
    setupShader(gl, vertSource, fragSource) {
        let vertices = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]
        const vertex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        const vertShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertShader, vertSource)
        gl.compileShader(vertShader)

        let fragShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragShader, fragSource)
        gl.compileShader(fragShader)

        let shaderProgram = gl.createProgram()
        gl.attachShader(shaderProgram, vertShader) 
        gl.attachShader(shaderProgram, fragShader)
        gl.linkProgram(shaderProgram)
        gl.useProgram(shaderProgram)

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        return shaderProgram
    }
    renderShader() {
        let canvas = this.canvasRef.current
        let gl = canvas.getContext('experimental-webgl')
        let program = this.setupShader(gl, defaultVertSource, this.props.fragmentSource)
        function set1f(name, value) {
            const loc = gl.getUniformLocation(program, name)
            gl.uniform1f(loc, value)
        }
        for (let key in this.props.shaderInputs) {
            set1f(key, this.props.shaderInputs[key])
        }
    
        let coord = gl.getAttribLocation(program, 'coordinates');
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);
        gl.clearColor(0.9, 0.9, 0.9, 1.0);
        gl.enable(gl.DEPTH_TEST); 
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0,0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
