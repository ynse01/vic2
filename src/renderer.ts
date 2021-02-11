import { ColorPalette } from "./color-palette";
import { IBuffers } from "./i-buffers";
import { IProgramInfo } from "./i-program-info";

export class Renderer {
    private gl: WebGLRenderingContext;
    private programInfo: IProgramInfo;
    private buffers: IBuffers;
    private texture: WebGLTexture;

    constructor (gl: WebGLRenderingContext, programInfo: IProgramInfo, buffers: IBuffers, texture: WebGLTexture) {
        this.gl = gl;
        this.programInfo = programInfo;
        this.buffers = buffers;
        this.texture = texture;
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
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
                                      // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition
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
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.textureCoord);
        }
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.programInfo.uniformLocations.sampler, 0);
        gl.uniform3fv(this.programInfo.uniformLocations.backgroundColor, this.buffers.backgroundColor);
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        requestAnimationFrame(this.renderLoop.bind(this));
    }
}