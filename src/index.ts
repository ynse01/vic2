import { ColorPalette } from "./color-palette";
import { DataTexture } from "./data-texture";
import { IBuffers } from "./i-buffers";
import { IProgramInfo } from "./i-program-info";
import { Renderer } from "./renderer";
import { CharacterModeShaders } from "./character-mode-shaders";


function initBuffers(gl: WebGLRenderingContext, characterModeShaders: CharacterModeShaders, characterRom: DataTexture): IBuffers| null {
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
        const characterRomCoordinates = [
            0.0, 0.0, 
            40.0, 0.0,
            0.0, 25.0, 
            40.0, 25.0
        ];
        if (characterRom.upload(characterRomCoordinates)) {
            const foregroundColor = [];
            foregroundColor.push(ColorPalette.lightBlue[0] / 256);
            foregroundColor.push(ColorPalette.lightBlue[1] / 256);
            foregroundColor.push(ColorPalette.lightBlue[2] / 256);
            characterModeShaders.setForegroundColor(foregroundColor);
            const backgroundColor = [];
            backgroundColor.push(ColorPalette.blue[0] / 256);
            backgroundColor.push(ColorPalette.blue[1] / 256);
            backgroundColor.push(ColorPalette.blue[2] / 256);
            characterModeShaders.setBackgroundColor(backgroundColor);
            return {
                position: positionBuffer
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
        const characterShaders = new CharacterModeShaders(gl);
        const shaderProgram = characterShaders.program;
        if (shaderProgram != null) {
            const programInfo: IProgramInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
                },
            };
            // Load the texture
            const characterRom = new DataTexture(gl, 'media/characters-c64.bin', 'aCharacterRomCoord');
            if (characterRom.texture != null) {
                // Here's where we call the routine that builds all the
                // objects we'll be drawing.
                const buffers = initBuffers(gl, characterShaders, characterRom);
                if (buffers != null) {
                    // Draw the scene
                    const renderer = new Renderer(gl, programInfo, buffers.position, characterShaders, characterRom);
                    renderer.renderLoop();
                }
            }
        }
    }
}
window.onload = main;