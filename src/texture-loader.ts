
export class TextureLoader {
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
                image.src = this.url;
            }
        }
        return this._texture;
    }
}