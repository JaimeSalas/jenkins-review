const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotEnv = require('dotenv-webpack');

module.exports = {
    entry: ["./index.js"],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ],
    },
    devServer: {
        port: 8081
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            scriptLoading: 'blocking',
            hash: true
        }),
        new DotEnv({
            path:'./.env',
            allowEmptyValues: true,
            systemvars: true,
        })
    ]
};
