<?php

function dblock_category($block_categories) {
    $block_categories[] = array(
        'slug' => 'dblocks',
        'title' => 'DBlocks',
    );

    return $block_categories;
}
add_filter('block_categories_all', 'dblock_category');
