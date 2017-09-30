const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    vendor: ['lodash', 'moment'],                       // 三方库
  },
  output: {
    filename: '[name]_[hash:20].js',                    // 输出带20位hash的文件名
    path: path.resolve(__dirname, 'dist/lib'),          // 输出路径
    library: '[name]_[hash:20]',
  },
  plugins: [
    new CleanWebpackPlugin(['dist/lib']),               // 清理dist文件件
    new UglifyJSPlugin(),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dist/lib', '[name]_manifest.json'),
      name: '[name]_[hash:20]',
    })
  ]
};
