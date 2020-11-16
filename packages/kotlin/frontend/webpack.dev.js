const path = require("path");
const common = require('./webpack.common.js');
require('dotenv').config({path: "../.env"})

module.exports = {
    ...common,
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: '../src/main/resources/public',
        watchContentBase: true,
        port: process.env.TS_PORT || 5000,
        publicPath: "/js/",
        proxy: {
            "/api": `http://localhost:${process.env.PORT || 8080}`
        }
    }
};