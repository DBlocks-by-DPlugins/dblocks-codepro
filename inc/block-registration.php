<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function dblocks_codepro_register_block() {
    register_block_type( constant('DBLOCKS_CODEPRO_PATH') . 'build/' );
}
add_action( 'init',  'dblocks_codepro_register_block' );
