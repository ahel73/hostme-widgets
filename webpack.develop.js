const webpack = require("webpack");
const { merge } = require("webpack-merge");
const appConfig = require("./webpack.app.js");


const developmentConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        hot: true,
        historyApiFallback: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}

module.exports = []
    .concat(appConfig)
    .map(x => merge(x, developmentConfig));