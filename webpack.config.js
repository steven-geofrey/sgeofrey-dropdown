const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    hot: true,
    port: 8000
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html',
      filename: 'index.html',
      inject: "body"
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.json$/i,
        exclude: /node_modules/,
        type: "asset/resource",
        use: [
            'file-loader?name=[name].[ext]&outputPath=data'
        ]
      },
      {
        test: /\.css$/,
        use: [
            "style-loader",
            "css-loader"
        ]
      }
    ]
  },
};