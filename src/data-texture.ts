
/**
 * This class encapsulates a Texture and Coordinate buffer.
 * This can be used to use arbitrary data in shader programs.
 */
export class DataTexture {
    private _gl: WebGLRenderingContext;
    private _url: string | null;
    private _data: number[] | null;
    private _width: number;
    private _height: number;
    private _attributeName: string | null;
    private _texture: WebGLTexture | null;
    private _buffer: WebGLBuffer | null;

    constructor(
        gl: WebGLRenderingContext,
        data: string | number[],
        attributeName: string | null,
        width: number,
        height: number
    ) {
        this._gl = gl;
        if (typeof data === 'string') {
            this._url = <string>data;
            this._data = null;
        } else {
            this._url = null;
            this._data = <number[]>data;
        }
        this._attributeName = attributeName;
        this._width = width;
        this._height = height;
        this._texture = null;
        this._buffer = null;
    }

    public get isReady(): boolean {
        return this.texture != null;
    }

    public get texture(): WebGLTexture | null {
        if (this._texture == null) {
            const texture = this._gl.createTexture();
            if (texture != null) {
                this._texture = texture;
                if (this._url != null) {
                    // Get something in temporary
                    this.texImage(new Uint8Array(this._width * this._height));
                    const request = new XMLHttpRequest();
                    request.open("GET", this._url, true);
                    request.responseType = "arraybuffer";
                    request.onload = () => {
                        const arrayBuffer = request.response;
                        const byteArray = new Uint8Array(arrayBuffer);
                        this.texImage(byteArray);
                    };
                    request.send(null);
                } else if (this._data != null) {
                    this.texImage(new Uint8Array(this._data));
                }
            }
        }
        return this._texture;
    }

    public upload(data: number[]): boolean {
        let result = false;
        const gl = this._gl;
        // Load the texture coordinates.
        const buffer = gl.createBuffer();
        if (buffer != null) {
            this._buffer = buffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            result = true;
        }
        return result;
    }

    public enable(shaderProgram: WebGLProgram): void {
        if (this._attributeName != null) {
            const gl = this._gl;
            const attribLocation = gl.getAttribLocation(shaderProgram, this._attributeName);
            if (attribLocation != -1) {
                // Tell WebGL how to pull out the texture coordinates from
                // the texture coordinate buffer into the textureCoord attribute.
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
                gl.vertexAttribPointer(
                    attribLocation,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(attribLocation);
            }
        }
    }

    public activate(index: number): void {
        const gl = this._gl;
        gl.activeTexture(index);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    private texImage(byteArray: Uint8Array) {
        const gl = this._gl;
        const level = 0;
        const internalFormat = gl.LUMINANCE;
        const srcFormat = gl.LUMINANCE;
        const srcType = gl.UNSIGNED_BYTE;
        const border = 0;
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this._width, this._height, border, srcFormat, srcType, byteArray);
        // Assume texture is not power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
}