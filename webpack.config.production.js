import path from "path";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import merge from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import baseConfig from "./webpack.config.base";

const config = merge(baseConfig, {
  devtool: "source-map",
  mode: "production",
  entry: {
    app: ["babel-polyfill", "./app/index"]
  },

  output: {
    path: path.join(__dirname, "app/dist"),
    publicPath: "../dist/"
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },

      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: "[name]__[local]___[hash:base64:5]"
              }
            }
          ]
        })
      },

      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: "[local]"
              }
            },
            {
              loader: "less-loader",
              options: {
                noIeCompat: true,
                strictMath: true
              }
            }
          ]
        })
      },

      {
        test: [/\.woff(\?v=\d+\.\d+\.\d+)?$/, /\.woff2(\?v=\d+\.\d+\.\d+)?$/],
        use: [
          {
            loader: "url-loader",
            options: { limit: 10000, mimetype: "application/font-woff" }
          }
        ]
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: { limit: 10000, mimetype: "application/octet-stream" }
          }
        ]
      },

      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [{ loader: "file-loader" }]
      },

      {
        test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
        use: [{ loader: "file-loader" }]
      },

      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: { limit: 10000, mimetype: "image/svg+xml" }
          }
        ]
      }
    ]
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ExtractTextPlugin({ filename: "style.css", allChunks: true }),
    new HtmlWebpackPlugin({
      filename: "../app.html",
      template: "app/app.html",
      inject: false
    })
  ],
  target: "electron-renderer"
});

export default config;
