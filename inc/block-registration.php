<?php

if (! defined('ABSPATH')) exit; // Exit if accessed directly

function dblocks_codepro_register_block() {
    // Check if block is already registered to prevent duplicate registration
    if (WP_Block_Type_Registry::get_instance()->is_registered('dblocks/dblocks-codepro')) {
        return;
    }
    
    register_block_type(constant('DBLOCKS_CODEPRO_PATH') . 'build/');
}
add_action('init', 'dblocks_codepro_register_block');

function dblocks_codepro_enqueue_editor_assets() {
    // Only load scripts in admin/editor context
    if (!is_admin()) {
        return;
    }
    
    // WordPress automatically loads editorScript from block.json
    // No need to manually enqueue it again
    
    // Only localize script in editor context
    if (wp_script_is('wp-editor') || wp_script_is('wp-block-editor')) {
        // Localize the script that's already loaded by block.json
        wp_localize_script('dblocks-dblocks-codepro-editor-script', 'DBlocksData', array(
            'restUrl' => rest_url('dblocks_codepro/v1/'),
        ));
    }
}
add_action('enqueue_block_editor_assets', 'dblocks_codepro_enqueue_editor_assets');