<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Gutenberg Utilities Class
 * Provides helper methods for Gutenberg detection and conditional loading
 *
 * WP 7+ requires blocks v3 with mandatory iframe — no classic editor fallbacks needed.
 */
class DBlocksCodePro_Gutenberg_Utils {

    /**
     * Check if Gutenberg editor should be loaded for current context
     *
     * @return bool True if Gutenberg should be loaded, false otherwise
     */
    public static function should_load_gutenberg_assets() {
        global $pagenow, $post;

        // Only load on post edit screens
        if (!in_array($pagenow, ['post.php', 'post-new.php'], true)) {
            return false;
        }

        return use_block_editor_for_post($post);
    }
}
