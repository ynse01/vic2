import { ColorPalette } from "./color-palette";

// Vertex shader
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

// Pixel shader
const psSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform lowp vec3 uBackgroundColor;
        
    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;
console.log(psSource);
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

function initBuffers(gl: WebGLRenderingContext): IBuffers| null {
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
        // Load the fragment shader uniform for the text colors.
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
        );
        // Load the texture coordinates.
        const textureCoordBuffer = gl.createBuffer();
        if (textureCoordBuffer != null) {
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
            const textureCoordinates = [
                0.0, 0.0, 
                1.0, 0.0,
                1.0, 1.0, 
                0.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
            const backgroundColor = [];
            backgroundColor.push(ColorPalette.blue[0] / 256);
            backgroundColor.push(ColorPalette.blue[1] / 256);
            backgroundColor.push(ColorPalette.blue[2] / 256);
            return {
                position: positionBuffer,
                backgroundColor: backgroundColor,
                textureCoord: textureCoordBuffer
            };
        }
    }
    return null;
}

function loadTexture(gl: WebGLRenderingContext, url: string): WebGLTexture | null {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 
        width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        // Assume texture is not power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    image.src = url;

    return texture;
}

interface IProgramInfo {
    program: WebGLShader,
    attribLocations: {
        vertexPosition: number,
        textureCoord: number
    },
    uniformLocations: {
        sampler: WebGLUniformLocation,
        backgroundColor: WebGLUniformLocation
    }
}

interface IBuffers {
    position: WebGLBuffer,
    backgroundColor: number[],
    textureCoord: WebGLBuffer
}

function drawScene(gl: WebGLRenderingContext, programInfo: IProgramInfo, buffers: IBuffers, texture: WebGLTexture): void {
    const bgColor = ColorPalette.lightBlue;
    gl.clearColor(bgColor[0] / 256, bgColor[1] / 256, bgColor[2] / 256, 1.0);
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
    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.textureCoord);
    }
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.sampler, 0);
    gl.uniform3fv(programInfo.uniformLocations.backgroundColor, buffers.backgroundColor);
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
                    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
                },
                uniformLocations: {
                    backgroundColor: gl.getUniformLocation(shaderProgram, 'uBackgroundColor')!,
                    sampler: gl.getUniformLocation(shaderProgram, 'uSampler')!,
                }
            };
            // Load the texture
            const texture = loadTexture(gl, 'cubetexture.png');
            if (texture != null) {
                // Here's where we call the routine that builds all the
                // objects we'll be drawing.
                const buffers = initBuffers(gl);
                if (buffers != null) {
                    // Draw the scene
                    drawScene(gl, programInfo, buffers, texture);
                }
            }
        }
    }
}
window.onload = main;