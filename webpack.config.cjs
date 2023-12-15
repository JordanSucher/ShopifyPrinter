const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './deployed/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'deployed', 'dist'),
        publicPath: '/dist/',
    },
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
              },
            },
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
    ]
    },
}