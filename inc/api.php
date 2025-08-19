<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * API Handler Class
 * Manages Monaco editor loading and API functionality
 */
class DBlocksCodePro_API {

    /**
     * Initialize the API functionality
     */
    public function __construct() {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_api'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_api'));
    }

    /**
     * Enqueue API scripts and Monaco editor
     */
    public function enqueue_api() {
        // Only load Monaco editor on block editor pages, not on admin settings
        global $pagenow;
        if ($pagenow === 'post.php' || $pagenow === 'post-new.php' || strpos($_SERVER['REQUEST_URI'], 'block-editor') !== false) {
            // Enqueue Monaco Editor
            wp_enqueue_script(
                'dblocks-monaco-loader',
                DBLOCKS_CODEPRO_URL . 'vendor/monaco/min/vs/loader.js',
                array(),
                '1.0',
                true
            );

            // Enqueue Monaco configuration (includes settings utility)
            wp_enqueue_script(
                'dblocks-monaco-config',
                DBLOCKS_CODEPRO_URL . 'inc/monaco-config.js',
                array('dblocks-monaco-loader'),
                '1.0',
                true
            );

            // Register a dummy JS file (can be empty)
            wp_register_script(
                'dblocks-codepro-api',
                DBLOCKS_CODEPRO_URL . 'inc/api.js',
                array('dblocks-monaco-config'),
                '1.0',
                true
            );

            // Pass plugin URL to JS
            wp_localize_script('dblocks-codepro-api', 'DBlocksCodePro', array(
                'pluginPath' => DBLOCKS_CODEPRO_URL,
                'monacoPath' => DBLOCKS_CODEPRO_URL . 'vendor/monaco/min/vs/',
            ));

            // Enqueue the script
            wp_enqueue_script('dblocks-codepro-api');
        }
    }
}

// Initialize the API handler
new DBlocksCodePro_API();