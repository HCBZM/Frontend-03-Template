const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          },
          {
            test: /\.css$/,
            use: [
              'vue-style-loader',
              'css-loader'
            ]
          }
        ]
      },
      plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
              { from: "./src/index.html", to: "[name].[ext]" },
            ],
        })
      ]
};