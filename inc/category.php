<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function dblocks_codepro_category($block_categories) {
    $block_categories[] = array(
        'slug' => 'dblocks',
        'title' => 'DBlocks',
    );

    return $block_categories;
}
add_filter('block_categories_all', 'dblocks_codepro_category');
