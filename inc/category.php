<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function DBLOCKS_CODEPRO_category($block_categories) {
    $block_categories[] = array(
        'slug' => 'dblocks',
        'title' => 'DBlocks',
    );

    return $block_categories;
}
add_filter('block_categories_all', 'DBLOCKS_CODEPRO_category');
