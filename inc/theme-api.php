<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Helper function to register GET/POST endpoints with standard patterns
 * 
 * @param string $route The API route
 * @param string $option_name The WordPress option name
 * @param mixed $default_value Default value for the option
 * @param string $post_param_name Parameter name in the JSON request
 */
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
    // Load settings from config file
    $settings = require_once DBLOCKS_CODEPRO_PATH . 'inc/config/settings.php';
    
    // Register all option endpoints using the helper function
    foreach ($settings as $setting) {
        register_dblocks_option_endpoints(
            $setting['route'],
            $setting['option_name'],
            $setting['default_value'],
            $setting['post_param_name']
        );
    }

    // Register plugin path endpoint (different pattern)
    register_rest_route('dblocks_codepro/v1', '/plugin-path', [
        'methods' => 'GET',
        'callback' => 'get_plugin_info',
        'permission_callback' => '__return_true'
    ]);
});

/**
 * Get plugin information
 * 
 * @return WP_REST_Response Plugin information response
 */
function get_plugin_info() {
    $plugin_info = [
        'plugin_url' => DBLOCKS_CODEPRO_URL,
        'plugin_name' => 'DBlocks Code Pro'
    ];
    return rest_ensure_response($plugin_info);
}