var webpack = require("webpack");
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'webpack'],
        files: ['spec/**/*.spec.ts'],
        mime: { 'test/x-typescript': ['ts', 'tsx'] },
        preprocessors: {
            'spec/**/*.spec.ts': ['webpack', 'sourcemap'],
        },
        webpack: {
            resolve: {
                extensions: ['.js', '.ts', '.tsx']
            },
            module: {
                rules: [
                    {test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/}
                ]
            },
            stats: {
                colors: true,
                modules: true,
                reasons: true,
                errorDetails: true
            },
            plugins: [
                new webpack.SourceMapDevToolPlugin({
                    filename: null, // if no value is provided the sourcemap is inlined
                    test: /\.(ts|js)($|\?)/i, // process .js and .ts files only
                    exclude: [ /node_modules/ ]
                })
            ]
        },
        reporters: ['spec'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true,
        concurrency: Infinity,
    })
}