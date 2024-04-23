<?php

function create_block_dblocks_codepro_block_init() {
    register_block_type( DBLOCKS_CODEPRO_DIR . 'build/' );
}
add_action( 'init', 'create_block_dblocks_codepro_block_init' );
