export interface IProgramInfo {
    program: WebGLShader,
    attribLocations: {
        vertexPosition: number,
        textureCoord: number
    },
    uniformLocations: {
        sampler: WebGLUniformLocation,
        foregroundColor: WebGLUniformLocation,
        backgroundColor: WebGLUniformLocation
    }
}