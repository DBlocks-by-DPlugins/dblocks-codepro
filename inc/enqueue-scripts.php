<?php

function enqueue_highlightjs_if_block_present() {
    if (is_admin()) {
        return; // Skip in admin panel
    }

    global $post;
    if ($post && has_block('dblocks/dblocks-codepro', $post)) {
        // Enqueue Highlight.js CSS
        wp_enqueue_style('highlightjs-css', DBLOCKS_CODEPRO_URL . 'vendor/highlight/styles/vs2015.min.css', array(), '1.0', 'all');

        // Base Highlight.js script
        wp_enqueue_script('highlightjs', DBLOCKS_CODEPRO_URL . 'vendor/highlight/highlight.min.js', array(), '1.0', true);

        $languages = ['html', 'css', 'scss', 'javascript', 'php', 'typescript', 'bash', 'twig', 'yaml', 'plaintext', 'json'];

        foreach ($languages as $lang) {
            wp_enqueue_script("highlightjs-lang-$lang", DBLOCKS_CODEPRO_URL . "vendor/highlight/languages/$lang.min.js", array('highlightjs'), '1.0', true);
        }

        // Initialize Highlight.js
        wp_add_inline_script('highlightjs', 'hljs.initHighlightingOnLoad();');
    }
}
add_action('wp_enqueue_scripts', 'enqueue_highlightjs_if_block_present');
