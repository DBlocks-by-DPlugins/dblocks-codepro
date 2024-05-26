<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function dblocks_codepro_register_category($categories) {
    $block_categories[] = array(
        'slug' => 'dblocks',
        'title' => 'DBlocks',
    );

    return $categories;
}
add_filter('block_categories_all', 'dblocks_codepro_register_category');
