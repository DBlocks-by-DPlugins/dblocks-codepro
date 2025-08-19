<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * DBlocks Code Pro Footer Editor Handler
 * Manages the React-based Monaco editor in the admin footer
 */
class DBlocksCodePro_Footer_Editor {

    /**
     * Initialize the footer editor functionality
     */
    public function __construct() {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_footer_editor_assets'));
        add_action('admin_footer', array($this, 'render_monaco_placeholder'));
    }

    /**
     * Enqueue footer editor assets
     */
    public function enqueue_footer_editor_assets() {
        // Get the asset file to load proper dependencies and version
        $asset_file = DBLOCKS_CODEPRO_PATH . 'build/footer-editor/index.asset.php';
        
        if (file_exists($asset_file)) {
            $asset = require($asset_file);
            
            // Enqueue footer editor React component with proper dependencies and version
            wp_enqueue_script(
                'dblocks-footer-editor',
                DBLOCKS_CODEPRO_URL . 'build/footer-editor/index.js',
                array_merge($asset['dependencies'], array('dblocks-monaco-config')),
                $asset['version'],
                true
            );
            
            // Enqueue footer editor styles
            wp_enqueue_style(
                'dblocks-footer-editor',
                DBLOCKS_CODEPRO_URL . 'build/footer-editor/style-index.css',
                array(),
                $asset['version']
            );
        }
    }

    /**
     * Render the Monaco editor placeholder in admin footer
     */
    public function render_monaco_placeholder() {
        echo '<div id="monaco-placeholder" style="display: none;">
            <div id="monaco-editor-container"></div>
        </div>';
    }
}

// Initialize the footer editor handler
new DBlocksCodePro_Footer_Editor();
