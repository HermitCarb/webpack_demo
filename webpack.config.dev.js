const merge = require('webpack-merge');
const webpack = require('webpack');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  devtool: 'cheap-module-eval-source-map',
  output: {
    filename: '[name].js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
    hot: true,         // 这里打开不知道为什么报错
    inline: true,
    host: '127.0.0.1',
    port: 8080,
  }
});