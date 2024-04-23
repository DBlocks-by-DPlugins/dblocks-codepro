<?php

add_action( 'rest_api_init', function () {
    register_rest_route( 'dblocks-codepro/v1', '/theme/', array(
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(get_option('dblocks_codepro_theme', 'vs-light'), 200);
        },
        'permission_callback' => '__return_true' // Allows public access to the GET method
    ));
    register_rest_route( 'dblocks-codepro/v1', '/theme/', array(
        'methods' => 'POST',
        'callback' => function ( $request ) {
            update_option('dblocks_codepro_theme', $request->get_json_params()['theme']);
            return new WP_REST_Response('Theme updated', 200);
        },
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' ); // Restricts POST access to users who can edit posts
        }
    ));
});
