const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
  entry: {
    common: ['./src/Welcome.js', './src/Image.js'],     // 项目中复用程度高的代码
    index: './src/index.js',
    index2: './src/index2.js',
  },
  output: {
    filename: '[name]_[chunkhash:20].js',               // 输出带20位hash的文件名
    path: path.resolve(__dirname, 'dist'),              // 输出路径
  },
  module: {
    rules: [{
      test: /\.css$/,                                   // CSS loader
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(png|svg|jpg|gif)$/,                     // 图片loader
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 102400,
            name: '[name]_[hash:20].[ext]',
            outputPath: 'image/'
          }
        }
      ]
    }]
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*.*']),               // 清理dist文件件
    new webpack.DllReferencePlugin({                    // webpack Dll
      context: __dirname,
      manifest: require(path.resolve(__dirname, 'dist/lib/vendor_manifest.json')),
    }),
    new webpack.optimize.CommonsChunkPlugin({           // 打包公共模块
      name: 'common',
      minChunks: 2,
    }),
    new webpack.optimize.CommonsChunkPlugin({           // manifest
      name: "manifest",
      minChunks: Infinity
    }),
    new HtmlWebpackPlugin({                             // 生成html入口
      filename: 'index.html',
      title: 'Webpack Sample Project',
      chunks: ['manifest', 'common', 'index'],
    }),
    new AddAssetHtmlPlugin({                            // 把dll生成的js文件拷贝到html
      files: 'index.html',
      includeSourcemap: false,
      filepath: path.resolve(__dirname, './dist/lib/*.js'),
    }),
    new HtmlWebpackPlugin({                             // 生成html入口2
      filename: 'index2.html',
      title: 'Webpack Sample Project2',
      chunks: ['manifest', 'common', 'index2'],
    }),
    new AddAssetHtmlPlugin({                            // 把dll生成的js文件拷贝到html
      files: 'index2.html',
      includeSourcemap: false,
      filepath: path.resolve(__dirname, './dist/lib/*.js'),
    }),
  ]
};
