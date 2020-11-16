const common = require('./webpack.common.js');
const path = require("path");

module.exports = {
    ...common,
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.resolve('../src/main/resources/public/js'),
        filename: '[name].bundle.js'
    },
};