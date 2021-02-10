// C64 color palette
const colorBlack = [0.0, 0.0, 0.0];
const colorWhite = [1.0, 1.0, 1.0];
const colorRed = [0.53125, 0.0, 0.0];
const colorCyan = [0.6640625, 1.0, 0.929679];
const colorViolet = [0.796875, 0.265625, 0.796875];
const colorGreen = [0.0, 0.796875, 0.33203125];
const colorBlue = [72, 58, 170];
const colorYellow = [0.0, 0.0, 0,0];
const colorOrange = [0.0, 0.0, 0,0];
const colorBrown = [0.0, 0.0, 0,0];
const colorLightRed = [0.0, 0.0, 0,0];
const colorDarkGrey = [0.0, 0.0, 0,0];
const colorGrey = [0.0, 0.0, 0,0];
const colorLightGreen = [0.0, 0.0, 0,0];
const colorLightBlue = [134, 122, 222];
const colorLightGrey = [0.0, 0.0, 0,0];

function colorToString(color: number[]): string {
    const str = 
        (color[0] / 256).toPrecision(4) + "," +
        (color[1] / 256).toPrecision(4) + "," +
        (color[2] / 256).toPrecision(4);
    return str;
}

// Vertex shader
const vsSource = `
    attribute vec4 aVertexPosition;

    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Pixel shader
const psSource = `
    void main() {
        gl_FragColor = vec4(${colorToString(colorBlue)}, 1.0);
    }
`;

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram| null {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // Create the shader program
    const shaderProgram = gl.createProgram();
    if (shaderProgram != null && vertexShader != null && fragmentShader != null) {
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }
    return null;
}
  
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader| null {
    const shader = gl.createShader(type);  
    if (shader != null) {
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    return null;
}

function initBuffers(gl: WebGLRenderingContext): {position: WebGLBuffer}| null {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();
    if (positionBuffer != null) {
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Now create an array of positions for the square.
        const positions = [
            -0.8,  0.7,
            0.8,  0.7,
            -0.8, -0.7,
            0.8, -0.7,
        ];
        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
        );
        return {
            position: positionBuffer,
        };
    }
    return null;
}

interface IProgramInfo {
    program: WebGLShader,
    attribLocations: {
        vertexPosition: number
    }
}

function drawScene(gl: WebGLRenderingContext, programInfo: IProgramInfo, buffers: { position: WebGLBuffer}): void {
    gl.clearColor(colorLightBlue[0] / 256, colorLightBlue[1] / 256, colorLightBlue[2] / 256, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition
        );
    }
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

function main() {
    const canvas = <HTMLCanvasElement>document.querySelector("#glCanvas");
    if (canvas != null) {
        const gl = canvas.getContext("webgl");
        if (gl == null) {
            throw new Error("Unable to initialize WebGL.")
        }

        const shaderProgram = initShaderProgram(gl, vsSource, psSource);
        if (shaderProgram != null) {
            const programInfo: IProgramInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                },
            };   
            // Here's where we call the routine that builds all the
            // objects we'll be drawing.
            const buffers = initBuffers(gl);
            if (buffers != null) {
                // Draw the scene
                drawScene(gl, programInfo, buffers);
            }
        }
    }
}
window.onload = main;