<?php
/**
 * Plugin Name:       DBlocks Code Pro
 * Description:       Advanced HTML Block and Code Syntax Highlighterin in one
 * Requires at least: 6.5.2
 * Requires PHP:      7.0
 * Version:           1.0.5.1
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

// Include the components
require_once DBLOCKS_CODEPRO_DIR . 'inc/block-registration.php';
require_once DBLOCKS_CODEPRO_DIR . 'inc/category.php';
require_once DBLOCKS_CODEPRO_DIR . 'inc/enqueue-scripts.php';
require_once DBLOCKS_CODEPRO_DIR . 'inc/theme-api.php';



/**
 * For plugin to work on multiple installs replace 'UNIQUE_PLUGIN_NAME'
 * Update plugin _VER on the line 32
 * Update plugin _REMOTE_URL on the line 34
 */
$plugin_prefix = 'DBLOCKSCODEPRO';

define($plugin_prefix . '_DIR', plugin_basename(__DIR__));
define($plugin_prefix . '_BASE', plugin_basename(__FILE__));
define($plugin_prefix . '_PATH', plugin_dir_path(__FILE__));
define($plugin_prefix . '_VER', '1.0.5.1');
define($plugin_prefix . '_CACHE_KEY', 'blockscodepro-cache-key-for-plugin');
define($plugin_prefix . '_REMOTE_URL', 'http://selfhost.dplugins.com/wp-content/uploads/plugins/18/info.json');

require constant($plugin_prefix . '_PATH') . 'inc/update.php';

new DPUpdateChecker(
	constant($plugin_prefix . '_DIR'),
	constant($plugin_prefix . '_VER'),
	constant($plugin_prefix . '_CACHE_KEY'),
	constant($plugin_prefix . '_REMOTE_URL'),
	constant($plugin_prefix . '_BASE')
);