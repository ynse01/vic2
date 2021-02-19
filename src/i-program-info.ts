export interface IProgramInfo {
    program: WebGLShader,
    attribLocations: {
        vertexPosition: number,
        characterRomCoord: number
    },
    uniformLocations: {
        sampler: WebGLUniformLocation,
        foregroundColor: WebGLUniformLocation,
        backgroundColor: WebGLUniformLocation
    }
}