<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function dblocks_codepro_register_block() {
    // Register the block type
    register_block_type( constant('DBLOCKS_CODEPRO_PATH') . 'build/' );
    wp_enqueue_script(
        'dblocks-codepro-script',
        plugin_dir_url(__FILE__) . 'build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor'),
        null,
        true
    );
    wp_localize_script('dblocks-codepro-script', 'DBlocksData', array(
        'restUrl' => rest_url('dblocks_codepro/v1/'), // Dynamically generate REST URL
    ));
}

add_action( 'init', 'dblocks_codepro_register_block' );
