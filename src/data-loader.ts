
export class DataLoader {
    private gl: WebGLRenderingContext;
    private url: string;
    private _texture: WebGLTexture | null;

    constructor(gl: WebGLRenderingContext, url: string) {
        this.gl = gl;
        this.url = url;
        this._texture = null;
    }

    public get texture(): WebGLTexture | null {
        if (this._texture == undefined) {
            const gl = this.gl;
            const texture = gl.createTexture();
            if (texture != null) {
                this._texture = texture;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                // Because images have to be downloaded over the internet
                // they might take a moment until they are ready.
                // Until then put a single pixel in the texture so we can
                // use it immediately. When the image has finished downloading
                // we'll update the texture with the contents of the image.
                const level = 0;
                const internalFormat = gl.LUMINANCE;
                const srcFormat = gl.LUMINANCE;
                const srcType = gl.UNSIGNED_BYTE;
                const pixel = new Uint8Array([0]);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 
                    1, 1, 0, srcFormat, srcType, pixel);

                const request = new XMLHttpRequest();
                request.open("GET", this.url, true);
                request.responseType = "arraybuffer";

                request.onload = () => {
                    const arrayBuffer = request.response;
                    const byteArray = new Uint8Array(arrayBuffer);
                    const width = 8;
                    const height = 256;
                    const border = 0;
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, byteArray);
                    // Assume texture is not power of 2
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                };
                request.send(null);
            }
        }
        return this._texture;
    }
}