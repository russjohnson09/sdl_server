'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const env = config.build.env

// const UglifyJsPlugin = require("uglifyjs-3-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

//https://medium.com/js-dojo/how-to-configure-webpack-4-with-vuejs-a-complete-guide-209e943c4772

//https://github.com/vuejs/vue-loader/issues/1177

//update vue loader

module.exports = merge(baseWebpackConfig, {
  mode: "production",
  optimization: {

    minimizer: [

      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll:
                  true
              }
            }
          ],
        }
      }),

      new UglifyJsPlugin({
        cache:
          true,
        parallel:
          true,
        sourceMap: false
      })
    ]
  }
  // module: {
  //   rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  // },
  // // cheap-module-eval-source-map is faster for development
  // devtool: '#cheap-module-eval-source-map',
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env': config.dev.env
  //   }),
  //   // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
  //   new webpack.HotModuleReplacementPlugin(),
  //   new webpack.NoEmitOnErrorsPlugin(),
  //   // https://github.com/ampedandwired/html-webpack-plugin
  //   new HtmlWebpackPlugin({
  //     filename: 'index.html',
  //     template: 'index.html',
  //     inject: true
  //   }),
  //   new FriendlyErrorsPlugin()
  // ]
})
