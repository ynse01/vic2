import { CharacterModeRenderTarget } from "./character-mode-render-target";
import { CharacterModeShaders } from "./character-mode-shaders";
import { ColorPalette } from "./color-palette";
import { DataTexture } from "./data-texture";

export class Renderer {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private characterTarget: CharacterModeRenderTarget;
    private characterShaders: CharacterModeShaders;
    private characterRom: DataTexture;

    constructor (gl: WebGLRenderingContext, program: WebGLProgram, characterTarget: CharacterModeRenderTarget, characterShaders: CharacterModeShaders, characterRom: DataTexture) {
        this.gl = gl;
        this.program = program;
        this.characterTarget = characterTarget;
        this.characterShaders = characterShaders;
        this.characterRom = characterRom;
    }

    public renderLoop(): void {
        const gl = this.gl;
        const bgColor = ColorPalette.lightBlue;
        gl.clearColor(bgColor[0] / 256, bgColor[1] / 256, bgColor[2] / 256, 1.0);
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.characterTarget.uploadPositions();
        this.characterRom.enable(this.program);
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.program);
        this.characterRom.activate(gl.TEXTURE0);
        this.characterShaders.upload();
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        requestAnimationFrame(this.renderLoop.bind(this));
    }
}