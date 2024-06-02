<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if (!function_exists('dblocks_block_category')) {
    function dblocks_block_category($block_categories) {
        $block_categories[] = array(
            'slug' => 'dblocks',
            'title' => 'DBlocks'
        );

        return $block_categories;
    }
}

add_filter('block_categories_all', 'dblocks_block_category');
