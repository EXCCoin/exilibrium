import webpack from "webpack";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";

export default merge(baseConfig, {
  devtool: "source-map",
  mode: "production",
  entry: ["babel-polyfill", "./app/main.development"],
  output: {
    path: __dirname,
    filename: "./app/main.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],
  optimization: {
    runtimeChunk: false
  },
  target: "electron-main",
  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
});
