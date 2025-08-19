<?php
/**
 * Highlight.js Integration
 * 
 * Handles registration and enqueuing of highlight.js scripts and styles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Language mapping for highlight.js
 * Maps editor language names to highlight.js language files
 */
function dblocks_codepro_get_language_mapping() {
    return array(
        'html' => 'xml',        // HTML uses XML language support in highlight.js
        'css' => 'css',
        'javascript' => 'javascript',
        'js' => 'javascript',
        'json' => 'json',
        'php' => 'php',
        'plaintext' => 'plaintext',
        'scss' => 'scss',
        'sass' => 'scss',
        'shell' => 'shell',
        'bash' => 'shell',
        'sh' => 'shell',
        'twig' => 'twig',
        'typescript' => 'typescript',
        'ts' => 'typescript',
        'xml' => 'xml',
        'yaml' => 'yaml',
        'yml' => 'yaml'
    );
}

/**
 * Get the language script handle for a given editor language
 * 
 * @param string $editorLanguage The language from the editor
 * @return string|false The script handle or false if not found
 */
function dblocks_codepro_get_language_script_handle($editorLanguage) {
    $language_map = dblocks_codepro_get_language_mapping();
    $language_key = strtolower($editorLanguage);
    
    if (isset($language_map[$language_key])) {
        return 'hl-language-' . $language_map[$language_key];
    }
    
    return false;
}

/**
 * Register highlight.js scripts and styles
 */
function dblocks_codepro_register_highlight_assets() {
    // Register highlight.js themes
    wp_register_style(
        'hl-theme-light', // Handle
        plugins_url('vendor/highlight/styles/github.min.css', DBLOCKS_CODEPRO_BASE),
        array(), // Dependencies
        '1.0.0', // Version
        'all' // Media
    );
    
    wp_register_style(
        'hl-theme-dark', // Handle
        plugins_url('vendor/highlight/styles/github-dark.min.css', DBLOCKS_CODEPRO_BASE),
        array(), // Dependencies
        '1.0.0', // Version
        'all' // Media
    );
    
    // Register highlight.js core (minimal version)
    wp_register_script(
        'highlightjs-core',
        plugins_url('vendor/highlight/highlight.min.js', DBLOCKS_CODEPRO_BASE),
        array(),
        '1.0.0',
        true
    );

    // Register individual language scripts
    $languages = array(
        'css',
        'javascript',
        'json',
        'php',
        'plaintext',
        'scss',
        'shell',
        'twig',
        'typescript',
        'xml',
        'yaml',
    );
    
    foreach ($languages as $lang) {
        wp_register_script(
            'hl-language-' . $lang,
            plugins_url("vendor/highlight/languages/{$lang}.min.js", DBLOCKS_CODEPRO_BASE),
            array('highlightjs-core'), // Add dependency on core
            '1.0.0',
            true
        );
    }
}

// Hook into WordPress
add_action('wp_enqueue_scripts', 'dblocks_codepro_register_highlight_assets');

/**
 * Get the current editor theme
 * 
 * @return string The current theme ('vs-dark' or 'vs-light')
 */
function dblocks_codepro_get_current_theme() {
    return get_option('dblocks_editor_theme', 'vs-dark');
}

/**
 * Enqueue highlight.js assets only when needed
 * This function should be called from the render function when syntax highlighting is enabled
 */
function dblocks_codepro_enqueue_highlight_assets($editorLanguage = '') {
    // Enqueue core script
    wp_enqueue_script('highlightjs-core');
    
    // Get current theme from database (cached)
    $current_theme = get_option('dblocks_editor_theme', 'vs-dark');
    
    // Enqueue appropriate theme
    if ($current_theme === 'vs-dark') {
        wp_enqueue_style('hl-theme-dark');
    } else {
        wp_enqueue_style('hl-theme-light');
    }
    
    // Enqueue language script if needed
    if (!empty($editorLanguage)) {
        $script_handle = dblocks_codepro_get_language_script_handle($editorLanguage);
        if ($script_handle) {
            wp_enqueue_script($script_handle);
        }
    }
    
    // Add inline script for initialization
    wp_add_inline_script('highlightjs-core', '
        document.addEventListener("DOMContentLoaded", function() {
            if (typeof hljs !== "undefined") {
                hljs.highlightAll();
            }
        });
    ');
}
