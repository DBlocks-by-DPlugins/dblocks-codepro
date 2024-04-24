<?php

function DBLOCKS_CODEPRO_block_init() {
    register_block_type( DBLOCKS_CODEPRO_DIR . 'build/' );
}
add_action( 'init', 'DBLOCKS_CODEPRO_block_init' );
