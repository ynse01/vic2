import { ColorPalette } from "./color-palette";
import { DataLoader } from "./data-loader";
import { IBuffers } from "./i-buffers";
import { IProgramInfo } from "./i-program-info";
import { Renderer } from "./renderer";

// Vertex shader
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aCharacterRomCoord;

    varying highp vec2 vCharacterRomCoord;

    void main() {
        gl_Position = aVertexPosition;
        vCharacterRomCoord = aCharacterRomCoord;
    }
`;

// Pixel shader
const psSource = `
    precision highp float;

    varying highp vec2 vCharacterRomCoord;

    uniform sampler2D uSampler;
    uniform lowp vec3 uBackgroundColor;
    uniform lowp vec3 uForegroundColor;
        
    void main() {
        vec2 charIndex = floor(vCharacterRomCoord);
        vec2 pixelIndex = mod(vCharacterRomCoord, 1.0) * 8.0;
        // Char texture has single character on 1 row (8 bytes). And 256 rows in total.
        vec2 charTextureCoord = vec2((pixelIndex.y + 0.5) / 8.0, (charIndex.x + 0.5) / 256.0);
        vec4 textureColor = texture2D(uSampler, charTextureCoord);
        float byte = textureColor.r * 256.0;
        float bit = floor(pixelIndex.x);
        if (bit == 7.0) {
            if (mod(byte, 2.0) >= 1.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 6.0) {
            if (mod(byte, 4.0) >= 2.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 5.0) {
            if (mod(byte, 8.0) >= 4.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 4.0) {
            if (mod(byte, 16.0) >= 8.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 3.0) {
            if (mod(byte, 32.0) >= 16.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 2.0) {
            if (mod(byte , 64.0) >= 32.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 1.0) {
            if (mod(byte, 128.0) >= 64.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
        if (bit == 0.0) {
            if (byte >= 128.0) {
                gl_FragColor = vec4(uForegroundColor, 1.0);
            } else {
                gl_FragColor = vec4(uBackgroundColor, 1.0);
            }
        }
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
        const characterRomCoordBuffer = gl.createBuffer();
        if (characterRomCoordBuffer != null) {
            gl.bindBuffer(gl.ARRAY_BUFFER, characterRomCoordBuffer);
            const characterRomCoordinates = [
                0.0, 0.0, 
                40.0, 0.0,
                0.0, 25.0, 
                40.0, 25.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(characterRomCoordinates), gl.STATIC_DRAW);
            const foregroundColor = [];
            foregroundColor.push(ColorPalette.lightBlue[0] / 256);
            foregroundColor.push(ColorPalette.lightBlue[1] / 256);
            foregroundColor.push(ColorPalette.lightBlue[2] / 256);
            const backgroundColor = [];
            backgroundColor.push(ColorPalette.blue[0] / 256);
            backgroundColor.push(ColorPalette.blue[1] / 256);
            backgroundColor.push(ColorPalette.blue[2] / 256);
            return {
                position: positionBuffer,
                foregroundColor: foregroundColor,
                backgroundColor: backgroundColor,
                characterRomCoord: characterRomCoordBuffer
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
            const foregroundColor = gl.getUniformLocation(shaderProgram, 'uForegroundColor');
            const backgroundColor = gl.getUniformLocation(shaderProgram, 'uBackgroundColor');
            const sampler = gl.getUniformLocation(shaderProgram, 'uSampler');
            if (foregroundColor != null && backgroundColor != null && sampler != null) {
                const programInfo: IProgramInfo = {
                    program: shaderProgram,
                    attribLocations: {
                        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                        characterRomCoord: gl.getAttribLocation(shaderProgram, 'aCharacterRomCoord')
                    },
                    uniformLocations: {
                        foregroundColor: foregroundColor,
                        backgroundColor: backgroundColor,
                        sampler: sampler
                    }
                };
                // Load the texture
                const loader = new DataLoader(gl, 'media/characters-c64.bin');
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