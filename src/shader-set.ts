
export class ShaderSet {

    private _gl: WebGLRenderingContext;
    private _vsSource: string;
    private _psSource: string;
    private _program: WebGLProgram | null;

    constructor(gl: WebGLRenderingContext, vsSource: string, psSource: string) {
        this._gl = gl;
        this._vsSource = vsSource;
        this._psSource = psSource;
        this._program = null;
    }

    /**
    * Initialize a shader program, so WebGL knows how to draw our data
    */
    public get program(): WebGLProgram| null {
        if (this._program == null) {
            const gl = this._gl;
            const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, this._vsSource);
            const pixelShader = this.loadShader(gl, gl.FRAGMENT_SHADER, this._psSource);
            // Create the shader program
            const shaderProgram = gl.createProgram();
            if (shaderProgram != null && vertexShader != null && pixelShader != null) {
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, pixelShader);
                gl.linkProgram(shaderProgram);
                // If creating the shader program failed, alert
                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                    return null;
                }
                this._program = shaderProgram;
            }
        }
        return this._program;
    }
  
    /**
    * creates a shader of the given type, uploads the source and
    * compiles it.
    */
    public loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader| null {
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

}