const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

module.exports = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins,
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: 'node_modules/monaco-editor/min',
					to: '../vendor/monaco/min', // relative to build/
					noErrorOnMissing: true,
				},
			],
		} ),
	],
};
