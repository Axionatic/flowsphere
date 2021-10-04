const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: false,
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/app/index.html"
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "[name]-[contenthash].css" })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin()
    ],
  }
};