<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

function DBLOCKS_CODEPRO_enqueue_highlightjs_if_block_present() {
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

        if ($syntax_highlight_active) {
            $syntax_theme_setting = get_option('dblocks_codepro_syntax_theme', 'light');
            $style_url = $syntax_theme_setting === 'dark' ? 
                         DBLOCKS_CODEPRO_URL . 'vendor/highlight/styles/vs2015.min.css' :
                         DBLOCKS_CODEPRO_URL . 'vendor/highlight/styles/vs.min.css';
            wp_enqueue_style('highlightjs-css', $style_url, array(), '1.0', 'all');
            wp_enqueue_script('highlightjs', DBLOCKS_CODEPRO_URL . 'vendor/highlight/highlight.min.js', array(), '1.0', true);

            $languages = ['html', 'css', 'scss', 'javascript', 'php', 'typescript', 'bash', 'twig', 'yaml', 'plaintext', 'json'];
            foreach ($languages as $lang) {
                wp_enqueue_script("highlightjs-lang-$lang", DBLOCKS_CODEPRO_URL . "vendor/highlight/languages/$lang.min.js", array('highlightjs'), '1.0', true);
            }

            wp_add_inline_script('highlightjs', 'hljs.initHighlightingOnLoad();');
        }
    }
}
add_action('wp_enqueue_scripts', 'DBLOCKS_CODEPRO_enqueue_highlightjs_if_block_present');