var path = require("path");
var webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const PACKAGE = require("./package.json");

// Phaser webpack config
var phaserModule = path.join(__dirname, "/node_modules/phaser/");
var phaser = path.join(phaserModule, "src/phaser.js");

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || "false")),

  // I did this to make webpack work, but I'm not really sure it should always be true
  WEBGL_RENDERER: true,

  // I did this to make webpack work, but I'm not really sure it should always be true
  CANVAS_RENDERER: true,
});

module.exports = {
  entry: {
    app: [path.resolve(__dirname, "src/main.js")],

    //vendor: ['pixi']
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "./",
    filename: "js/bundle.js",
  },
  plugins: [
    definePlugin,
    new CleanWebpackPlugin(),
    new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),

    new HtmlWebpackPlugin({
      filename: "index.html", // path.resolve(__dirname, 'build', 'index.html'),
      template: "./src/index.html",
      chunks: ["vendor", "app"],
      chunksSortMode: "manual",
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
      hash: true,
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "assets", to: "assets" }],
    }),
    new ZipPlugin({
      path: "../",
      filename: `ys-em-up-${PACKAGE.version}.zip`,
    }),
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ["babel-loader"], include: path.join(__dirname, "src") },
      { test: /phaser-split\.js$/, use: "raw-loader" },
      { test: [/\.vert$/, /\.frag$/], use: "raw-loader" },
    ],
  },
  optimization: {
    minimize: true,
  },

  /*node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    alias: {
      'phaser': phaser,

    }
  }*/
};
