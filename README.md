# Webpack 配置入门

> 更新：Webpack4已经发布，本篇是基于Webpack3的，请注意。
> 更正：
> 
>   1.package.json中使用了应该使用本地webpack而不是全局webpack。
> ```
>   "scripts": {
>     "test": "echo \"Error: no test specified\" && exit 1",
>     "dist": "webpack",
>     "build:dll": "webpack --config webpack.config.dll.js",
>     "build:dev": "webpack-dev-server --config webpack.config.dev.js --open",
>     "build:pord": "webpack --config webpack.config.pord.js"
>   },
> ```
>   应为：
> ```
>   "scripts": {
>     "test": "echo \"Error: no test specified\" && exit 1",
>     "dist": "./node_modules/.bin/webpack",
>     "build:dll": "./node_modules/.bin/webpack --config webpack.config.dll.js",
>     "build:dev": "./node_modules/.bin/webpack-dev-server --config webpack.config.dev.js --open",
>     "build:pord": "./node_modules/.bin/webpack --config webpack.config.pord.js"
>   },
> ```
> 
> 2. webpack.config.js文件中output.publicPath缺失，应为:
> ```
>   output: {
>     publicPath: "http://www.example.com/", // <---- 这里填写web访问地址，域名、IP、CDN等
>     filename: '[name]_[chunkhash:20].js',               // 输出带20位hash的文件名
>     path: path.resolve(__dirname, 'dist'),              // 输出路径
>   },
> ```
> output.publicPath会更正文件或资源的前缀，在正式部署时特别必要。

## 一、什么是webpack，为什么要使用它？

### 1.官方解释

>webpack是一个现代JavaScript应用程序的模块打包器(module bundler)。

### 2.个人理解

webpack是一个模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块进行处理，找到其它的模块如css及一些浏览器不能直接运行的拓展语言模块Scss，TypeScript等，并选择相应的插件进行处理，并将处理结果转换打包为合适的格式供浏览器使用。

### 3.优缺点

Grunt以及Gulp是在一个配置文件中指定对文件处理的具体流程，如校验->编译->组合->压缩等。配置比较繁琐，但是可定制性比较高。

webpack把整个项目当成整体，从入口查找文件关系，然后整体的以文件为单位使用loader对代码进行处理，最后打包为一个或者多个浏览器识别的文件。配置相对简单，处理速度快，高级场景下定制能力有限，但是大部分情况下可以替代Grunt以及Gulp。

## 二、安装webpack

### 1.安装

#### 1.1前置条件

安装nodejs，[nodejs.org](https://nodejs.org/en/)，不再详述

#### 1.2安装方式

在终端运行命令：

```Bash
# 全局安装
npm install -g webpack
# 安装到项目目录
npm install --save-dev webpack
```

>上面两个命令可以选择执行一个，但建议执行两个。项目中安装一个置指定版本的webpack，全局的webpack作为备份项。

## 三、项目中的webpack

### 1.项目

如果已经有npm项目请略过。

```Bath
# 前往工作区，[$WORKSPACE]替换为自己的工作区路径
cd [$WORKSPACE]
# 创建项目目录
mkdir webpack_demo
# 初始化package.json，可以一路略过
npm init
```

### 2.安装webpack

```Bash
# 安装的项目目录
npm install --save-dev webpack
```

### 3.Demo01 - Hello Webpack

建立如下目录结构

```
.
├── dist
│   └── index.html
├── package.json
├── public
└── src
    ├── Welcome.js
    └── index.js

```

代码如下：

```HTML
<!--index.html-->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Webpack Sample Project</title>
  </head>
  <body>
    <div id='root'>
    </div>
    <script src="bundle.js"></script>
  </body>
</html>
```

```JavaScript
// index.js
import welcome from './Welcome.js'

document.querySelector("#root").appendChild(welcome());
```



```JavaScript
// Welcome.js
export default function() {
  var welcome = document.createElement('div');
  welcome.textContent = "Hello webpack!";
  return welcome;
};
```

webpack可以通过命令行使用，可以先通过下面的方式调用：

```
$> node_modules/.bin/webpack src/index.js dist/bundle.js
Hash: 098382ad52c485fbdff8
Version: webpack 3.6.0
Time: 66ms
    Asset     Size  Chunks             Chunk Names
bundle.js  2.78 kB       0  [emitted]  main
   [0] ./src/index.js 96 bytes {0} [built]
   [1] ./src/Welcome.js 138 bytes {0} [built]
```

此时可以动过浏览器访问dist/index.html

### 4.Demo02 - 通过配置文件来使用webpack

webpack虽然支持使用命令行的方式配置使用，但Demo01中使用命令行的方式输入起来还是比较繁琐。webpack支持使用配置文件进行参数配置。

在项目根目录下创建webpack.config.js文件（这也是webpack的默认配置文件）：

```JavaScript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

然后可以执行命令进行编译打包：

```Bash
# 指定配置文件
./node_modules/.bin/webpack --config webpack.config.js
# 使用默认配置文件
./node_modules/.bin/webpack
# 使用作用域最近的webpack，并且使用默认配置文件
webpack
```

虽然现在可以直接使用`webpack `命令进行打包，但是如果需要定制其他的打包配置时，就会比较麻烦，这个时候可以用npm脚本。

在package.json中scripts项下添加：

```JSON
{
  ...
  "scripts": {
    "dist": "webpack"
  },
  ...
}
```

此时可以通过命令行`npm run dist`进行打包。

### 5.资源管理,loader

#### 5.1.Demo03 - CSS样式

CSS需要使用css-loader和style-loader进行处理。css-loader解释@import和url()，会import/require()后再解析它们。style-loader会把原来的CSS代码插入页面中的一个style标签中。

先安装style-loader和css-loader

```Bash
npm install --save-dev style-loader css-loader
```

修改webpack.config.js如下：

```JavaScript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }]
  }
};
```

修改Welcome.js如下：

```JavaScript
import './style.css';

export default function() {		// 这里之前的‘module.exports = ’写法打包正常，但是运行时报错
  var welcome = document.createElement('div');
  welcome.textContent = "Hello webpack!";
  welcome.classList.add('welcome');
  return welcome;
};
```

添加`src/style.css`文件：

```CSS
.welcome {
  color: red;
}
```

`npm run dist`打包后运行，可以看到welcome样式已经发生改变。

#### 5.2.Demo04 - 图片资源

图片等静态资源在开发阶段时的相对路径与生产环境中的不尽相同，所以需要对这些文件进行路径转换，此时可以使用file-loader。另外如果图片较多，会发送很多请求，而浏览器能够同时发送的请求数有限，大量的图片资源会降低也面性能，可以通过url-loader把部分图片编码打包到文件中，url-loader是对file-loader的封装，这里使用url-loader。

安装file-loader、url-loader:

```
npm install --save-dev file-loader url-loader
```

添加资源文件`src/image/iconrar.png`(105KB),`src/image/iconrar.png`(87KB)


修改webpack.config.js：

```JavaScript
...
module.exports = {
...
  module: {
    rules: [
    ...
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 102400,       // 这里以100KB为分界线
              name: '[name].[ext]',
            }
          }
        ]
      }
    ...
    ]
  }
  ...
};
```

修改`src/index.js`文件：

```JavaScript
import welcome from './Welcome.js'
import image from './Image.js'
import './style.css';

const root = document.querySelector("#root")
root.appendChild(welcome());
root.appendChild(image('image1'));
root.appendChild(image('image2'));
```

添加`src/Image.js`文件：

```JavaScript
export default function(className) {
  var image = document.createElement('div');
  image.classList.add(className);
  return image;
}
```

在`src/style.js`中添加样式

```CSS
...
.image1 {
  width: 200px;
  height: 200px;
  background-image: url('./image/iconrar.png');
  background-size: contain;
}

.image2 {
  width: 200px;
  height: 200px;
  background-image: url('./image/iconzip.png');
  background-size: contain;
}
```

`npm run dist`打包后运行，可以看到图片已经添加到了页面上。观察`dist`文件夹，只有一个图片拷贝进来，然后再观察bundle.js文件，会发现有一片图片编码区。

### 6.Demo05 - 分片打包

随着项目体量的增加，整个项目打包为单一的bundle可能会严重影响首屏加载时间，这个时候可以把原来单一的bundle分为多个文件，也就是webpack分片打包。

修改webpack.config.js，在配置中添加入口，这里可以使用动态入口，如使用node代码遍历代码文件。

```JavaScript
  ...
  entry: {
    index: './src/index.js',
    image: './src/Image.js',
    welcome: './src/Welcome.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  ...
```

此时尝试打包成功，但是访问index.html异常，控制台报错。因为index.html中引用的bundle.js已经变更为三个js文件。因为这个入口配置可能经常改变，手动去`dist/index.html`修改script引用比较繁琐，可以使用`HtmlWebpackPlugin`插件来自动生成`dist/index.html`，或者使用`html-webpack-template`插件在模版的基础上生成`dist/index.html`。这里使用`HtmlWebpackPlugin`插件。

安装`html-webpack-plugin`

```Bash
npm install --save-dev html-webpack-plugin
```

修改`webpack.config.js`

```JavaScript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new HtmlWebpackPlugin({ title: 'Webpack Sample Project' })
  ]
  ...
};
```

使用`html-webpack-plugin`生成的`dist/index.html`已经没有id为root的div了，我们修改一下`src/index.js`

```JavaScript
import welcome from './Welcome.js'
import image from './Image.js'
import './style.css';

const root = document.querySelector('body')
root.appendChild(welcome());
root.appendChild(image('image1'));
root.appendChild(image('image2'));
```


现在已经可以使用webpack来分片打包了。webpack把打包后的内容放置在`dist`目录中，目录中的内容部署后，浏览器就能够访问到。但是由于浏览器的缓存策略，如果我们在部署新版本时不更改资源的文件名，浏览器可能会认为它没有被更新，就会使用它的缓存版本。由于缓存的存在，当你需要获取新的代码时，就会显得很棘手。

为了解决这一问题，我们可以使用`output.filename`来进行文件名替换，来确保浏览器获取到修改后的文件。

修改webpack.config.js，在输出的文件名中加入哈希码`chunkhash`

```JavaScript
  ...
  output: {
    filename: '[name]_[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  ...
```

这时候打包后可以正常访问，但是你会发现`dist`文件夹下会有很多文件，这是因为随着每次修改项目文件，项目文件的chunkhash发生改变，会生成新的输出文件，但是旧有的文件没有被清除。通过使用`clean-webpack-plugin`插件可以在每次打包前删除dist文件夹。

安装`clean-webpack-plugin`

```Bash
npm install --save-dev clean-webpack-plugin
```

修改`webpack.config.js`

```JavaScript
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ title: 'Webpack Sample Project' })
  ]
  ...
};
```

现在完整的`webpack.config.js`文件如下：

```JavaScript
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    image: './src/Image.js',
    welcome: './src/Welcome.js',
  },
  output: {
    filename: '[name]_[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(png|svg|jpg|gif)$/,
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
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ title: 'Webpack Sample Project' })
  ]
};
```

### 7.Demo06 - 调试开发和热加载HMR

生产环境中仅部署时需要打包一下，但是在开发环境中需要不停的运行命令进行打包，是一件十分繁琐的事情，可以使用`webpack-dev-server`工具在代码发生改变时自动打包代码。

另外，我们会在上面配置文件的基础上对开发环境dev和生产环境pord进行扩展。需要使用`webpack-merge`模块。

安装`webpack-dev-server`和`webpack-merge`：

```Bash
npm install --save-dev webpack-dev-server webpack-merge
```

创建`webpack.config.dev.js`文件：

```JavaScript
const merge = require('webpack-merge');
const webpack = require('webpack');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  devtool: 'cheap-module-eval-source-map',    // 选择一个合适的sourcemap项
  output: {
    filename: '[name].js',                    // 在热加载时不能使用chunkhash
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
    hot: true,
    inline: true,
    host: '127.0.0.1',
    port: 8080,
  }
});
```

修改`package.json`，添加npm脚本：

```JSON
{
  ...
  "scripts": {
    "dist": "webpack",
    "build:dev": "webpack-dev-server --config webpack.config.dev.js --open"
  },
  ...
}
```

现在尝试运行`npm run build:dev`，浏览器会自动访问`127.0.0.1:8080/index.html`,即`contentBase`指定的目录下的index.html文件。

### 8.Demo07 - 混淆压缩和生产打包

生产环境下代码简单编译打包，不经混淆压缩就部署，容易被别有用心的人获取并分析代码，可能会增加产权问题和安全风险。webpack自带的uglifyjs-webpack-plugin插件可以来做混淆压缩

安装uglifyjs-webpack-plugin:
```Bash
npm install --save-dev uglifyjs-webpack-plugin
```

创建`webpack.config.pord.js`文件：

```JavaScript
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  plugins: [
    new UglifyJSPlugin()
  ]
});
```

修改`package.json`，添加npm脚本：

```JSON
{
  ...
  "scripts": {
    "dist": "webpack",
    "build:dev": "webpack-dev-server --config webpack.config.dev.js --open",
    "build:pord": "webpack --config webpack.config.pord.js"
  },
  ...
}
```

现在尝试运行`npm run build:pord`，这个时候可以查看`dist`文件夹下的js文件，可以看到js已经被混淆压缩了。同时，`uglifyjs-webpack-plugin`实现了`tree-shaking`能力，能够优化掉未使用的代码。



### 9.Dome08 - 公共代码分离

公共代码分为两部分，一部分是三方的库，一部分是项目中写的复用程度比较高的代码。实例项目中三方库使用`lodash`和`moment`，而`src/Welcome.js`和`src/Image.js`作为服用程度比较高的库被单独打包。

我们需要新建入口文件复制`index.js`为`index2.js`，作为第二个入口文件。这样`src/Welcome.js`和`src/Image.js`为两个入口公用的模块，可以单独打爆出来。

打包公共模块在开发环境和生产环境都适用，所以修改`webpack.config.js`文件如下：

```JavaScript
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    vendor: ['lodash', 'moment'],                       // 三方库
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
    new CleanWebpackPlugin(['dist']),                   // 清理dist文件件
    new webpack.optimize.CommonsChunkPlugin({           // 打包公共模块
      names: ['vendor', 'common'],
      minChunks: 2,
    }),
    new HtmlWebpackPlugin({                             // 生成html入口
      filename: 'index.html',
      title: 'Webpack Sample Project',
      chunks: ['vendor', 'common', 'index'],
    }),
    new HtmlWebpackPlugin({                             // 生成html入口2
      filename: 'index2.html',
      title: 'Webpack Sample Project2',
      chunks: ['vendor', 'common', 'index2'],
    }),
  ]
};
```

此时使用命令`npm run dist`打包，可以查看`dist`文件夹下的文件，`src/Welcome.js`和`src/Image.js`的确被打包到了`commons_[chunkhash:20].js`文件中，而`lodash`和`moment`也被打包到了`vender_[chunkhash:20].js`文件中，`index_[chunkhash:20].js`和`index2_[chunkhash:20].js`中并不含上面两部分代码。

虽然这样公共代码已经能够分离了，但是，项目越来越大，像`lodash`和`moment`这样的三方库也越来越多，每次打包都需要重新生成`vender.js`文件，特别是在开发中，效率严重被拉低。

webpack提供了dll技术来解决这个问题。

添加`webpack.config.dll.js`:

```JavaScript
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
```

此时可以使用`webpack --config webpack.config.dll.js`命令进行dll打包了。接下来需要使用`add-asset-html-webpack-plugin`插件来把上面配置文件生成的`vendor_[hash:20].js`写入到`html-webpack-plugin`插件生成的`index.html`中。

安装`add-asset-html-webpack-plugin`:

```Bash
npm install --save-dev add-asset-html-webpack-plugin
```

修改`webpack.config.js`如下:

```JavaScript
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

```

为了体现`lodash`和`moment`能够正常使用：

修改`src/Welcome.js`

```JavaScript
import moment from 'moment';
import _ from 'lodash';

export default function() {
  var arr = [0, 1, 2];
  _.fill(arr, 0);
  arr[1] = [moment().format('YYYY-MM-DD')];

  var welcome = document.createElement('div');
  welcome.textContent = 'Hello webpack!' + arr.join(' <> ');
  welcome.classList.add('welcome');
  return welcome;
};
```

添加npm脚本:

```JSON
  "scripts": {
    "dist": "webpack",
    "build:dll": "webpack --config webpack.config.dll.js",
    "build:dev": "webpack-dev-server --config webpack.config.dev.js --open",
    "build:pord": "webpack --config webpack.config.pord.js"
  },
```

这样，第一次打包前运行`npm run build:dll`生成vendor包，然后运行`npm run build:dev`或`npm run build:pord`进行开发打包或部署打包。

### 10.Demo09 - CSS分离

安装`add-asset-html-webpack-plugin`:

```Bash
npm install --save-dev extract-text-webpack-plugin
```

修改`webpack.config.js`如下:

```JavaScript
...
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  ...
  module: {
    rules: [{
      test: /\.css$/,                                   // CSS loader
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader"
      })
    }, {
      test: /\.(png|svg|jpg|gif)$/,                     // 图片loader
      use: [
        {
          loader: 'url-loader',
          options: {
            publicPath: path.resolve(__dirname, 'dist'),// 这里需要修正image的publicPath
            limit: 102400,
            name: '[name]_[hash:20].[ext]',
            outputPath: '/image/'
          }
        }
      ]
    }]
  },
  plugins: [
    new CleanWebpackPlugin([                            // 清理dist文件件
      'dist/*.*',
      'dist/image/*.*',
      'dist/style/*.*'
    ]),
    new ExtractTextPlugin({                             // CSS分离
      filename: 'style/[name]_[contenthash:20].css',
    }),
    ...
  ]
};
```

前往webpack.config.dev.js，把默认config中实例化的CleanWebpackPlugin给splice掉，就可以在`npm run dist`、`npm run build:dev`、`npm run build:pord`三个环境下进行打包了。

Demo: https://github.com/HermitCarb/webpack_demo
