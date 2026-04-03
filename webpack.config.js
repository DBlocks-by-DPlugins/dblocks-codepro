const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'admin/index': './src/admin/index.js',
		'footer-editor/index': './src/footer-editor/index.js',
	},
	plugins: [
		...defaultConfig.plugins,
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: 'node_modules/monaco-editor/min',
					to: '../vendor/monaco/min',
					noErrorOnMissing: true,
					info: { minimized: true }, // already minified, skip processing
				},
			],
		} ),
	],
};
