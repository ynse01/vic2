import { ColorPalette } from "./color-palette";
import { IBuffers } from "./i-buffers";
import { IProgramInfo } from "./i-program-info";
import { Renderer } from "./renderer";
import { TextureLoader } from "./texture-loader";

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
    precision highp float;

    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform lowp vec3 uBackgroundColor;
        
    void main() {
        vec4 textureColor = texture2D(uSampler, vTextureCoord);
        vec3 max1 = min(uBackgroundColor, textureColor.rgb);
        gl_FragColor = vec4(max1, 1.0);
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
                0.0, 1.0, 
                1.0, 1.0
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

function main() {
    const canvas = <HTMLCanvasElement>document.querySelector("#glCanvas");
    if (canvas != null) {
        const gl = canvas.getContext("webgl");
        if (gl == null) {
            throw new Error("Unable to initialize WebGL.")
        }

        const shaderProgram = initShaderProgram(gl, vsSource, psSource);
        if (shaderProgram != null) {
            const backgroundColor = gl.getUniformLocation(shaderProgram, 'uBackgroundColor');
            const sampler = gl.getUniformLocation(shaderProgram, 'uSampler');
            if (backgroundColor != null && sampler != null) {
                const programInfo: IProgramInfo = {
                    program: shaderProgram,
                    attribLocations: {
                        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
                    },
                    uniformLocations: {
                        backgroundColor: backgroundColor,
                        sampler: sampler
                    }
                };
                // Load the texture
                const loader = new TextureLoader(gl, 'cubetexture.png');
                if (loader.texture != null) {
                    // Here's where we call the routine that builds all the
                    // objects we'll be drawing.
                    const buffers = initBuffers(gl);
                    if (buffers != null) {
                        // Draw the scene
                        const renderer = new Renderer(gl, programInfo, buffers, loader.texture);
                        renderer.renderLoop();
                    }
                }
            }
        }
    }
}
window.onload = main;