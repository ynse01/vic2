export interface IProgramInfo {
    program: WebGLShader,
    attribLocations: {
        vertexPosition: number
    },
    uniformLocations: {
        sampler: WebGLUniformLocation,
        foregroundColor: WebGLUniformLocation,
        backgroundColor: WebGLUniformLocation
    }
}