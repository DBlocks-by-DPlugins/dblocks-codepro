<?php
/**
 * Plugin Name:       DBlocks Code Pro
 * Description:       Advanced HTML Block and Code Syntax Highlighterin in one
 * Requires at least: 6.5.2
 * Requires PHP:      7.0
 * Version:           1.0.9
 * Author:            DPlugins
 * * Author URI:      https://dplugins.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dblocks-codepro
 * @package           CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Define plugin URLs and PATHs
define( 'DBLOCKS_CODEPRO_DIR', plugin_dir_path( __FILE__ ) );
define( 'DBLOCKS_CODEPRO_URL', plugin_dir_url( __FILE__ ) );

/**
 * Set up plugin prefixes and constants.
 * Update plugin _VER on line 30
 * Update plugin _REMOTE_URL on line 32
 */
$plugin_prefix = 'DBLOCKSCODEPRO';

// Define relevant paths and URLs
define($plugin_prefix . '_PATH', plugin_dir_path(__FILE__));
define($plugin_prefix . '_URL', plugin_dir_url(__FILE__));
define($plugin_prefix . '_DIR', plugin_basename(__DIR__));
define($plugin_prefix . '_BASE', plugin_basename(__FILE__));

// Include the components using the prefixed path constant
require_once constant($plugin_prefix . '_PATH') . 'inc/block-registration.php';
require_once constant($plugin_prefix . '_PATH') . 'inc/category.php';
require_once constant($plugin_prefix . '_PATH') . 'inc/enqueue-scripts.php';
require_once constant($plugin_prefix . '_PATH') . 'inc/theme-api.php';



function register_monaco_path() {

	// Localize script with plugin URL
	wp_localize_script(
		'monaco-editor-script-path',
		'chbeObj',
		[
			'pluginUrl' => plugins_url( '', __FILE__ )
		]
	);

}
add_action( 'init', 'register_monaco_path' );