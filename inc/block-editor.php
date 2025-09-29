<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Block Editor Handler Class
 * Manages block registration and Monaco editor assets
 */
class DBlocksCodePro_Block_Editor {

    /**
     * Initialize the block editor functionality
     */
    public function __construct() {
        add_action('init', array($this, 'register_blocks'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        add_action('admin_enqueue_scripts', array($this, 'localize_block_editor_settings'));
    }

    /**
     * Register blocks using blocks-manifest.php
     */
    public function register_blocks() {
        /**
         * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
         * based on the registered block metadata.
         * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
         *
         * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
         * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
         */
        if (function_exists('wp_register_block_types_from_metadata_collection')) {
            wp_register_block_types_from_metadata_collection(DBLOCKS_CODEPRO_DIR . '/build', DBLOCKS_CODEPRO_DIR . '/build/blocks-manifest.php');
            return;
        }

        /**
         * Registers the block(s) metadata from the `blocks-manifest.php` file.
         * Added to WordPress 6.7 to improve the performance of block type registration.
         *
         * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
         */
        if (function_exists('wp_register_block_metadata_collection')) {
            wp_register_block_metadata_collection(DBLOCKS_CODEPRO_DIR . '/build', DBLOCKS_CODEPRO_DIR . '/build/blocks-manifest.php');
        }
        
        /**
         * Registers the block type(s) in the `blocks-manifest.php` file.
         *
         * @see https://developer.wordpress.org/reference/functions/register_block_type/
         */
        $manifest_data = require DBLOCKS_CODEPRO_DIR . '/build/blocks-manifest.php';
        foreach (array_keys($manifest_data) as $block_type) {
            register_block_type(DBLOCKS_CODEPRO_DIR . "/build/{$block_type}");
        }
    }

    /**
     * Enqueue block editor assets (this hook only runs in Gutenberg)
     */
    public function enqueue_block_editor_assets() {
        // Only add settings localization here since Monaco is handled by API class
        // This ensures settings are available for the block editor
        wp_add_inline_script(
            'wp-blocks',
            'window.dblocksCodeProSettings = ' . wp_json_encode(DBlocksCodePro_Admin_Settings::get_all_settings()) . ';',
            'before'
        );
    }

    /**
     * Localize settings for block editor context
     */
    public function localize_block_editor_settings() {
        // Only add settings if Monaco scripts are loaded
        if (wp_script_is('dblocks-monaco-config', 'enqueued')) {
            wp_localize_script('dblocks-monaco-config', 'dblocksCodeProSettings', DBlocksCodePro_Admin_Settings::get_all_settings());
        }
    }
}

// Initialize the block editor handler
new DBlocksCodePro_Block_Editor();
