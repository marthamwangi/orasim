"use strict";
import path from "path";
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';

export default {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "bundle.js",
  },
  plugins: [
    new BrowserSyncPlugin({

      host: 'localhost',
      port: 3000,
      files: [
        '**/*.css',
        '**/*.js',
        '**/*.html',
        '**/*.ejs',
      ],
      proxy: 'http://localhost:8080/'
    })
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.(png|jpe?g|gif)$/i, use: ["file-loader"] },
    ],
  },
};
