import { CharacterModeShaders } from "./character-mode-shaders";
import { DataTexture } from "./data-texture";
import { Renderer } from "./renderer";
import { TextBuffer } from "./text-buffer";

export class CharacterModeRenderTarget {
    private _gl: WebGLRenderingContext;
    private _text: TextBuffer;
    private _foreColor: number[];
    private _backColor: number[];
    private _positionBuffer: WebGLBuffer | null;
    private _characterRom: DataTexture | null;
    private _textTexture: DataTexture | null;
    private _vertexPosition = -1;

    constructor(gl: WebGLRenderingContext, text: TextBuffer, foregroundColor: number[], backgroundColor: number[]) {
        this._gl = gl;
        this._text = text;
        this._foreColor = [];
        this._foreColor[0] = foregroundColor[0] / 255.0;
        this._foreColor[1] = foregroundColor[1] / 255.0;
        this._foreColor[2] = foregroundColor[2] / 255.0;
        this._backColor = [];
        this._backColor[0] = backgroundColor[0] / 255.0;
        this._backColor[1] = backgroundColor[1] / 255.0;
        this._backColor[2] = backgroundColor[2] / 255.0;
        this._positionBuffer = null;
        this._characterRom = null;
        this._textTexture = null;
    }

    public get characterRom(): DataTexture | null {
        return this._characterRom;
    }

    public get textTexture(): DataTexture | null {
        return this._textTexture;
    }

    public start(): void {
        const gl = this._gl;
        const characterShaders = new CharacterModeShaders(gl);
        const shaderProgram = characterShaders.program;
        if (shaderProgram != null) {
            this._vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            // Load the textures
            this._characterRom = new DataTexture(gl, 'media/characters-c64.bin', 'aCharacterRomCoord', 8, 256);
            this._textTexture = new DataTexture(gl, this._text.data, 'aTextCoord', 40, 25);
            if (this._characterRom.texture != null && this._textTexture.texture) {
                // Here's where we call the routine that builds all the
                // objects we'll be drawing.
                this.initBuffers(characterShaders);
                if (this._positionBuffer != null) {
                    // Draw the scene
                    const renderer = new Renderer(gl, shaderProgram, this, characterShaders);
                    renderer.renderLoop();
                }
            }
        }
    }

    public uploadPositions(): void {
        const gl = this._gl;
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(
            this._vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(this._vertexPosition);
    }

    private initBuffers(characterModeShaders: CharacterModeShaders): void {
        const gl = this._gl;
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
            const textCoordinates = [
                0.0, 0.0, 
                40.0, 0.0,
                0.0, 25.0, 
                40.0, 25.0
            ];
            if (this._textTexture != null && this._textTexture.upload(textCoordinates)) {
                const characterRomCoordinates = [
                    0.0, 0.0, 
                    40.0, 0.0,
                    0.0, 25.0, 
                    40.0, 25.0
                ];
                if (this._characterRom != null && this._characterRom.upload(characterRomCoordinates)) {
                    characterModeShaders.setForegroundColor(this._foreColor);
                    characterModeShaders.setBackgroundColor(this._backColor);
                    this._positionBuffer = positionBuffer;
                }
            }
        }
    }
    
}