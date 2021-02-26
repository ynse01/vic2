import { ShaderSet } from "./shader-set";

export class CharacterModeShaders {
        // Vertex shader
        private vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aCharacterRomCoord;

        varying highp vec2 vCharacterRomCoord;

        void main() {
            gl_Position = aVertexPosition;
            vCharacterRomCoord = aCharacterRomCoord;
        }
    `;

    // Pixel shader
    private psSource = `
        precision highp float;

        varying highp vec2 vCharacterRomCoord;

        uniform sampler2D uCharSampler;
        uniform sampler2D uTextSampler;

        uniform lowp vec3 uBackgroundColor;
        uniform lowp vec3 uForegroundColor;
            
        void main() {
            vec2 textIndex = floor(vCharacterRomCoord);
            vec2 textCoord = textIndex / vec2(40, 25);
            // Text texture has 25 rows of 40 pixels, containing the character code as pixel value.
            vec4 textColor = texture2D(uTextSampler, textCoord);
            vec2 pixelIndex = mod(vCharacterRomCoord, 1.0) * 8.0;
            // Char texture has single character on 1 row (8 bytes). And 256 rows in total.
            // This means the character code is equal to the row index.
            vec2 charTextureCoord = vec2((pixelIndex.y + 0.5) / 8.0, textColor.r);
            vec4 charColor = texture2D(uCharSampler, charTextureCoord);
            float byte = charColor.r * 256.0;
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
    
    private _gl: WebGLRenderingContext;
    private shaders: ShaderSet;
    private _foreColor: number[];
    private _backColor: number[];
    private _foreColorLocation: WebGLUniformLocation | null = null;
    private _backColorLocation: WebGLUniformLocation | null = null;
    private _charSamplerLocation: WebGLUniformLocation | null = null;
    private _textSamplerLocation: WebGLUniformLocation | null = null;

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this.shaders = new ShaderSet(gl, this.vsSource, this.psSource);
        this._foreColor = [1.0, 1.0, 1.0];
        this._backColor = [0.0, 0.0, 0.0];
    }

    public get program(): WebGLProgram | null {
        const program = this.shaders.program;
        if (program != null && this._charSamplerLocation == null) {
            const gl = this._gl;
            this._foreColorLocation = gl.getUniformLocation(program, 'uForegroundColor');
            this._backColorLocation = gl.getUniformLocation(program, 'uBackgroundColor');
            this._charSamplerLocation = gl.getUniformLocation(program, 'uCharSampler');
            this._textSamplerLocation = gl.getUniformLocation(program, 'uTextSampler');
        }
        return program;
    }

    public upload(): void {
        const gl = this._gl;
        gl.uniform1i(this._charSamplerLocation, 0);
        gl.uniform1i(this._textSamplerLocation, 1);
        gl.uniform3fv(this._foreColorLocation, this._foreColor);
        gl.uniform3fv(this._backColorLocation, this._backColor);
    }

    public setForegroundColor(color: number[]): void {
        this._foreColor = color;
    }

    public setBackgroundColor(color: number[]): void {
        this._backColor = color;
    }

}