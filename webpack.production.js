/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');

const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

module.exports = env => {
  return {
    mode: env.mode,

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {
            emitError: true,
            emitWarning: true,
            failOnError: true,
            failOnWarning: true
          }
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: [
            {
              loader: 'babel-loader'
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },

    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'game.[contenthash].js'
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css'
      }),

      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version + 'r')
      }),

      new webpack.ProgressPlugin()
    ],

    optimization: {
      minimizer: [new CssMinimizerPlugin()]
    }
  };
};
