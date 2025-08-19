<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Block Category Handler Class
 * Manages custom block category registration
 */
class DBlocksCodePro_Category {

    /**
     * Initialize the category functionality
     */
    public function __construct() {
        add_action('init', array($this, 'register_block_category'));
    }

    /**
     * Add custom block category
     */
    public function add_block_category($block_categories) {
        $block_categories[] = array(
            'slug' => 'dblocks',
            'title' => 'DBlocks'
        );

        return $block_categories;
    }

    /**
     * Register the block category
     */
    public function register_block_category() {
        add_filter('block_categories_all', array($this, 'add_block_category'));
    }
}

// Initialize the category handler
new DBlocksCodePro_Category();
