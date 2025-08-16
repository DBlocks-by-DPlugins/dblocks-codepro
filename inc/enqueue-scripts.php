<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function dblocks_codepro_enqueue_scripts() {
    if (is_admin()) {
        return; // Skip in admin panel
    }

    global $post;
    if ($post && has_block('dblocks/dblocks-codepro', $post)) {
        $blocks = parse_blocks($post->post_content);
        $syntax_highlight_active = false;

        foreach ($blocks as $block) {
            if ($block['blockName'] === 'dblocks/dblocks-codepro' && !empty($block['attrs']['syntaxHighlight'])) {
                $syntax_highlight_active = true;
                break;
            }
        }

        // No need to load highlight.js since Monaco editor handles all syntax highlighting
        // This eliminates unnecessary HTTP requests and reduces bundle size
    }
}
add_action('wp_enqueue_scripts', 'dblocks_codepro_enqueue_scripts');