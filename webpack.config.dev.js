const path = require('path')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const common = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	devtool: 'eval-source-map'
}

const client = {
	entry: './src/client/client',
	output: {
		path: path.join(__dirname, 'static'),
		filename: 'js/client-bundle.js'
	},
	module: {
		rules: common.module.rules.concat([
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract('css-loader')
			}
		])
	},
	plugins: [
		new ExtractTextPlugin('css/styles.css')
	]
}

const server = {
	entry: './src/server/server',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'server-bundle.js'
	},
	target: 'node',
	node: {
		__dirname: true
	},
	externals: [nodeExternals()]
}

module.exports = [
	Object.assign({}, common, client),
	Object.assign({}, common, server)
]
