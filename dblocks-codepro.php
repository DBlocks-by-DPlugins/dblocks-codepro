<?php
/**
 * Plugin Name:       DBlocks Code Pro
 * Description:       Advanced HTML Block and Code Syntax Highlighterin in one
 * Requires at least: 6.5.2
 * Requires PHP:      7.0
 * Version:           1.0.4
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