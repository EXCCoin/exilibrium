import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";
import { spawn } from "child_process";

//const port = process.env.PORT || 3000;

const statsOptions = {
  colors: true,
  chunks: false,
  children: false,
  timings: true,
  modules: false,
  warnings: true
};

export default merge(baseConfig, {
  devtool: "eval",
  mode: "development",
  watch: true,
  entry: {
    app: [
      "react-hot-loader/patch",
      `webpack-dev-server/client?http://localhost:${3000}/`,
      "webpack/hot/only-dev-server",
      "babel-polyfill",
      "./app/index"
    ]
  },
  output: {
    filename: "bundle.js",
    publicPath: "http://localhost:3000/dist/"
  },
  devServer: {
    port: 3000,
    publicPath: "http://localhost:3000/dist/",
    compress: true,
    stats: statsOptions,
    inline: true,
    lazy: false,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    contentBase: path.resolve(__dirname, "dist"),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false
    },
    before() {
      if (process.env.START_HOT) {
        console.log("Starting Main Process...");
        spawn("npm", ["run", "start-hot"], { shell: true, env: process.env, stdio: "inherit" })
          .on("close", code => process.exit(code))
          .on("error", spawnError => console.error(spawnError));
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.min\.css$/,
        use: [ {
          loader: "style-loader"
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true
          }
        } ]
      },

      {
        test: /^((?!\.min).)*\.css$/,
        use: [ {
          loader: "style-loader"
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true,
            modules: true,
            localIdentName: "[name]__[local]___[hash:base64:5]"
          }
        } ]
      },

      {
        test: /\.less$/,
        use: [ {
          loader: "style-loader"
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true,
            modules: true,
            importLoaders: 1,
            localIdentName: "[local]"
          }
        }, {
          loader: "less-loader",
          options: {
            noIeCompat: true,
            strictMath: true
          }
        } ]
      },

      {
        test: [ /\.woff(\?v=\d+\.\d+\.\d+)?$/, /\.woff2(\?v=\d+\.\d+\.\d+)?$/ ],
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "application/font-woff" }
        } ]
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "application/octet-stream" }
        } ]
      },

      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [ { loader: "file-loader" } ]
      },

      {
        test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
        use: [ { loader: "file-loader" } ]
      },

      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "image/svg+xml" }
        } ]
      },

      {
        test: /\.(mp4)$/,
        use: [ {
          loader: "file-loader",
          options: {
            mimetype: "video/mp4"
          }
        } ]
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    }),
    new webpack.LoaderOptionsPlugin({ minimize: false, debug: true, options: {} })
  ],
  target: "electron-renderer"
});
