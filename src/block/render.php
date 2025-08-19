<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

// Get block attributes
$content = $attributes['content'] ?? '';
$syntaxHighlight = $attributes['syntaxHighlight'] ?? false;
$editorLanguage = $attributes['editorLanguage'] ?? '';
$useWrapper = $attributes['useWrapper'] ?? false;

// Get global settings for header display
$showCopyButton = get_option('dblocks_editor_copy_button', 'on') === 'on';
$showLanguageLabel = get_option('dblocks_syntax_display_language', 'on') === 'on';

// Render based on variation type
if ($syntaxHighlight) {
    // Syntax Highlighter variation - only load assets when this variation is used
    $wrapper_attributes = get_block_wrapper_attributes();
    
    // Enqueue highlight.js assets only for this variation
    dblocks_codepro_enqueue_highlight_assets($editorLanguage);
    
    // Get current theme from database
    $current_theme = dblocks_codepro_get_current_theme();
    
    echo '<div ' . $wrapper_attributes . ' data-copy-enabled="' . ($showCopyButton ? 'true' : 'false') . '" data-theme="' . esc_attr($current_theme) . '">';
    
    // Only show header if copy button or language label is enabled in global settings
    if ($showCopyButton || $showLanguageLabel) {
        echo '<div class="syntax-highlighter-header">';
        if ($showLanguageLabel) {
            echo '<div class="language-label">' . esc_html($editorLanguage) . '</div>';
        }
        if ($showCopyButton) {
            echo '<button class="copy-code-button" data-code-content="' . esc_attr($content) . '">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M358.27-260q-25.14 0-42.7-17.57Q298-295.13 298-320.27v-455.38q0-25.14 17.57-42.71 17.56-17.56 42.7-17.56h359.38q25.14 0 42.71 17.56 17.56 17.57 17.56 42.71v455.38q0 25.14-17.56 42.7Q742.79-260 717.65-260H358.27Zm0-47.96h359.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.47-3.84-3.84-8.46-3.84H358.27q-4.62 0-8.46 3.84-3.85 3.85-3.85 8.47v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM242.35-144.08q-25.14 0-42.71-17.57-17.56-17.56-17.56-42.7v-503.34h47.96v503.34q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h407.34v47.96H242.35Zm103.61-163.88v-480 480Z"/></svg>            
            <span class="copy-code-button-text">Copy</span>
            </button>';
        }
        echo '</div>';
    }
    
    echo '<pre class="syntax-highlighter-content"><code class="language-' . esc_attr($editorLanguage) . '">';
    // Escape HTML content to prevent highlight.js security warnings
    echo esc_html($content);
    echo '</code></pre>';
    echo '</div>';
	
} else {
    // Advanced Custom HTML variation
    if ($useWrapper) {
        $wrapper_attributes = get_block_wrapper_attributes();
        echo '<div ' . $wrapper_attributes . '>';
        echo wp_kses_post($content);
        echo '</div>';
    } else {
        echo wp_kses_post($content);
    }
}
?>
