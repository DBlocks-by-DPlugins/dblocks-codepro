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