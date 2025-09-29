<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Gutenberg Utilities Class
 * Provides helper methods for Gutenberg detection and conditional loading
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

        // Check if Gutenberg editor is being used for this post
        if (function_exists('use_block_editor_for_post')) {
            return use_block_editor_for_post($post);
        }

        // Fallback: check if Gutenberg is available via screen
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            return $screen && $screen->is_block_editor();
        }

        // Last fallback: assume Gutenberg if WordPress 5.0+
        return version_compare(get_bloginfo('version'), '5.0', '>=');
    }

    /**
     * Check if we're on a Gutenberg block editor page
     * 
     * @return bool True if on block editor page
     */
    public static function is_block_editor_page() {
        global $pagenow;

        // Check for block editor pages
        if (in_array($pagenow, ['post.php', 'post-new.php'], true)) {
            return self::should_load_gutenberg_assets();
        }

        // Check for block editor URL patterns
        if (strpos($_SERVER['REQUEST_URI'], 'block-editor') !== false) {
            return true;
        }

        return false;
    }

    /**
     * Check if Classic Editor plugin is active and forcing classic editor
     * 
     * @return bool True if classic editor is forced
     */
    public static function is_classic_editor_forced() {
        // Check if Classic Editor plugin is active and forcing classic editor
        if (function_exists('classic_editor_replace') && 
            get_option('classic-editor-replace') === 'classic') {
            return true;
        }

        // Check if post type doesn't support blocks
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            if ($screen && !post_type_supports($screen->post_type, 'editor')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get current editor type (gutenberg or classic)
     * 
     * @return string 'gutenberg' or 'classic'
     */
    public static function get_current_editor_type() {
        if (self::is_classic_editor_forced()) {
            return 'classic';
        }

        if (self::should_load_gutenberg_assets()) {
            return 'gutenberg';
        }

        return 'classic';
    }
}
