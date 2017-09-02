const path = require('path')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

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
	}
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
				use: ExtractTextPlugin.extract({
					use: [
						'css-loader',
						{
							loader: 'clean-css-loader',
							options: {
								level: 2
							}
						}
					]
				})
			}
		])
	},
	plugins: [
		new ExtractTextPlugin('css/styles.css'),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			parallel: true,
			uglifyOptions: {
				compress: {
					dead_code: true,
					conditionals: true,
					comparisons: true,
					evaluate: true,
					booleans: true,
					loops: true,
					unused: true,
					toplevel: true,
					if_return: true,
					join_vars: true,
					cascade: true,
					collapse_vars: true,
					reduce_vars: true,
					warnings: false
				}
			}
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.HashedModuleIdsPlugin(),
		new CompressionPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.(js|css)$/,
			threshold: 10240,
			minRatio: 0.8
		})
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
	externals: [nodeExternals()],
	devtool: 'eval-source-map'
}

module.exports = [
	Object.assign({}, common, client),
	Object.assign({}, common, server)
]
