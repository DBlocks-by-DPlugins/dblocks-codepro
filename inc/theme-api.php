<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// Helper function to register GET/POST endpoints with standard patterns
function register_dblocks_option_endpoints($route, $option_name, $default_value, $post_param_name) {
    // GET endpoint
    register_rest_route('dblocks_codepro/v1', $route, array(
        'methods' => 'GET',
        'callback' => function() use ($option_name, $default_value) {
            return new WP_REST_Response(esc_attr(get_option($option_name, $default_value)), 200);
        },
        'permission_callback' => '__return_true'
    ));
    
    // POST endpoint
    register_rest_route('dblocks_codepro/v1', $route, array(
        'methods' => 'POST',
        'callback' => function($request) use ($option_name, $post_param_name) {
            update_option($option_name, $request->get_json_params()[$post_param_name]);
            return new WP_REST_Response(sprintf('%s updated', ucfirst($post_param_name)), 200);
        },
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
}

add_action('rest_api_init', function() {
    // Register all option endpoints using the helper function
    register_dblocks_option_endpoints('/theme/', 'dblocks_codepro_theme', 'vs-light', 'theme');
    register_dblocks_option_endpoints('/syntax-theme/', 'dblocks_codepro_syntax_theme', 'light', 'syntaxTheme');
    register_dblocks_option_endpoints('/editor-font-size/', 'dblocks_codepro_editor_font_size', '14px', 'editorFontSize');
    register_dblocks_option_endpoints('/editor-height/', 'dblocks_codepro_editor_height', '500px', 'editorHeight');

    // Register plugin path endpoint (different pattern)
    register_rest_route('dblocks_codepro/v1', '/plugin-path', [
        'methods' => 'GET',
        'callback' => 'get_plugin_info',
        'permission_callback' => '__return_true'
    ]);
});

function get_plugin_info() {
    $plugin_info = [
        'plugin_url' => DBLOCKS_CODEPRO_URL,
        'plugin_name' => 'DBlocks Code Pro'
    ];
    return rest_ensure_response($plugin_info);
}