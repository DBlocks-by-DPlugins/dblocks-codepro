<?php

if (! defined('ABSPATH')) exit; // Exit if accessed directly

function dblocks_codepro_register_block() {
    register_block_type(constant('DBLOCKS_CODEPRO_PATH') . 'build/');
}
add_action('init', 'dblocks_codepro_register_block');

function dblocks_codepro_enqueue_editor_assets() {
    wp_enqueue_script(
        'dblocks-codepro-editor-script',
        plugin_dir_url(__FILE__) . '../build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor'),
        null,
        true
    );
    wp_localize_script('dblocks-codepro-editor-script', 'DBlocksData', array(
        'restUrl' => rest_url('dblocks_codepro/v1/'),
    ));
}
add_action('enqueue_block_editor_assets', 'dblocks_codepro_enqueue_editor_assets');