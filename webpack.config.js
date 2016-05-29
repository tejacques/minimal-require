var webpack = require('webpack');

module.exports = {
	entry: './testWebpack.js',
	output: {
		filename: 'dist/webpackBundle.js',
		library: 'webpackBundle',
		libraryTarget: 'amd'
	},
	plugins: [new webpack.optimize.UglifyJsPlugin({
		mangle: true,
		compress: true
	})]
}