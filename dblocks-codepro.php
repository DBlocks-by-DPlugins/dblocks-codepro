<?php

/**
 * Plugin Name:       DBlocks Code Pro
 * Description:       Advanced HTML Block and Code Syntax Highlighterin in one
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Version:           1.3.2
 * Author:            DPlugins
 * * Author URI:      https://dplugins.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dblocks-codepro
 * @package           CreateBlock
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

// Define plugin URLs and PATHs
define('DBLOCKS_CODEPRO_DIR',	plugin_dir_path(__FILE__));
define('DBLOCKS_CODEPRO_PATH',	plugin_dir_path(__FILE__));
define('DBLOCKS_CODEPRO_URL',	plugin_dir_url(__FILE__));
define('DBLOCKS_CODEPRO_BASE',	plugin_basename(__FILE__));



$inc_dir = DBLOCKS_CODEPRO_PATH . 'inc/';

foreach (glob($inc_dir . '*.php') as $file) {
	require_once $file;
}
