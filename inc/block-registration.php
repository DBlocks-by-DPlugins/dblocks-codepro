<?php

function DBLOCKSCODEPRO_block_init() {
    register_block_type( constant('DBLOCKSCODEPRO_PATH') . 'build/' );
}
add_action( 'init', 'DBLOCKSCODEPRO_block_init' );
