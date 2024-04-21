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
// Enqueue Prism.js scripts and styles if the current post contains the custom block.
// ========================================================== //

function enqueue_prism_if_block_present() {
    if (is_admin()) {
        // This is necessary to ensure the editor style and scripts load in the Gutenberg editor.
        return;
    }

    // Check if we're on a single post or page that has our custom block.
    global $post;
    if ($post && has_block('dblocks/dblocks-codepro', $post)) {
        // Enqueue Prism CSS
        wp_enqueue_style('prism-css', 'https://cdn.jsdelivr.net/npm/prismjs/themes/prism-okaidia.css', array(), '1.0', 'all');
        // Enqueue Prism JS
        wp_enqueue_script('prism-js', 'https://cdn.jsdelivr.net/npm/prismjs/prism.js', array(), '1.0', true);
    }
}
add_action('wp_enqueue_scripts', 'enqueue_prism_if_block_present');
