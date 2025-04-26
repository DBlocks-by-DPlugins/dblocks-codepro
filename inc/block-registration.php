<?php

if (! defined('ABSPATH')) exit; // Exit if accessed directly

function dblocks_codepro_register_block() {
    register_block_type(constant('DBLOCKS_CODEPRO_PATH') . 'build/');
}
add_action('init', 'dblocks_codepro_register_block');

function dblocks_codepro_localize_script() {
    // Only load in admin/editor context
    if (!is_admin()) {
        return;
    }
    
    // Only localize script in editor context
    if (wp_script_is('wp-editor') || wp_script_is('wp-block-editor')) {
        // The handle is based on the format: namespace-blockname-editor-script
        wp_localize_script('dblocks-dblocks-codepro-editor-script', 'DBlocksData', array(
            'restUrl' => rest_url('dblocks_codepro/v1/'),
        ));
    }
}
add_action('enqueue_block_editor_assets', 'dblocks_codepro_localize_script');