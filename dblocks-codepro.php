<?php
/**
 * Plugin Name:       DBocks Codepro
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dblocks-codepro
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}



// ========================================================== //
// Register Block Type
// ========================================================== //

function create_block_dblocks_codepro_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'create_block_dblocks_codepro_block_init' );



// ========================================================== //
// Create custom blocks category
// ========================================================== //

function dblock_category($block_categories)
{

	$block_categories[] = array(
		'slug' => 'dblocks',
		'title' => 'DBlocks',
	);

	return $block_categories;

}
add_filter('block_categories_all', 'dblock_category');



// ========================================================== //
// Enqueue Syntax Highlighting
// ========================================================== //


function enqueue_highlightjs_if_block_present() {
    if (is_admin()) {
        // Skip in admin panel as it's not needed in the editor.
        return;
    }

    global $post;
    if ($post && has_block('dblocks/dblocks-codepro', $post)) {
        // Get the plugin directory URL
        $plugin_url = plugin_dir_url(__FILE__);

        // Enqueue Highlight.js CSS
        wp_enqueue_style('highlightjs-css', $plugin_url . 'vendor/highlight/styles/vs2015.min.css', array(), '1.0', 'all');

        // Base Highlight.js script
        wp_enqueue_script('highlightjs', $plugin_url . 'vendor/highlight/highlight.min.js', array(), '1.0', true);

        // Array of languages used in your block
        $languages = ['html', 'css', 'scss', 'javascript', 'php', 'typescript', 'bash', 'twig', 'yaml', 'plaintext', 'json'];

        foreach ($languages as $lang) {
            wp_enqueue_script("highlightjs-lang-$lang", $plugin_url . "vendor/highlight/languages/$lang.min.js", array('highlightjs'), '1.0', true);
        }

        // Initialize Highlight.js
        wp_add_inline_script('highlightjs', 'hljs.initHighlightingOnLoad();');
    }
}
add_action('wp_enqueue_scripts', 'enqueue_highlightjs_if_block_present');


