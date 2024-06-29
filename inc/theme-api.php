<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

add_action('rest_api_init', function () {
    // Routes for the main editor theme
    register_rest_route('dblocks_codepro/v1', '/theme/', array(
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(esc_attr(get_option('dblocks_codepro_theme', 'vs-light')), 200);
        },
        'permission_callback' => '__return_true'
    ));
    register_rest_route('dblocks_codepro/v1', '/theme/', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            update_option('dblocks_codepro_theme', $request->get_json_params()['theme']);
            return new WP_REST_Response('Theme updated', 200);
        },
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    // New routes for the syntax highlight theme
    register_rest_route('dblocks_codepro/v1', '/syntax-theme/', array(
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(esc_attr(get_option('dblocks_codepro_syntax_theme', 'light')), 200);
        },
        'permission_callback' => '__return_true'
    ));
    register_rest_route('dblocks_codepro/v1', '/syntax-theme/', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            update_option('dblocks_codepro_syntax_theme', $request->get_json_params()['syntaxTheme']);
            return new WP_REST_Response('Syntax theme updated', 200);
        },
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    // Routes for editor font size
    register_rest_route('dblocks_codepro/v1', '/editor-font-size/', array(
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(esc_attr(get_option('dblocks_codepro_editor_font_size', '14px')), 200);
        },
        'permission_callback' => '__return_true'
    ));
    register_rest_route('dblocks_codepro/v1', '/editor-font-size/', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            update_option('dblocks_codepro_editor_font_size', $request->get_json_params()['editorFontSize']);
            return new WP_REST_Response('Editor font size updated', 200);
        },
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    // Routes for editor height
    register_rest_route('dblocks_codepro/v1', '/editor-height/', array(
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(esc_attr(get_option('dblocks_codepro_editor_height', '50vh')), 200);
        },
        'permission_callback' => '__return_true'
    ));
    register_rest_route('dblocks_codepro/v1', '/editor-height/', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            update_option('dblocks_codepro_editor_height', $request->get_json_params()['editorHeight']);
            return new WP_REST_Response('Editor height updated', 200);
        },
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    // Register new REST API endpoint to get the plugin path
    register_rest_route('dblocks_codepro/v1', '/plugin-path', [
        'methods' => 'GET',
        'callback' => 'get_plugin_info',
        'permission_callback' => '__return_true'
    ]);

});

function get_plugin_info() {
    $plugin_info = [
        'plugin_url' => DBLOCKS_CODEPRO_URL
    ];
    return rest_ensure_response($plugin_info);
}
