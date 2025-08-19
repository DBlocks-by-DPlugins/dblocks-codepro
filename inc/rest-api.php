<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * DBlocks Code Pro REST API
 */
class DBlocksCodePro_REST_API {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('dblocks-codepro/v1', '/settings', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_settings'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array()
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_settings'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'editor_theme' => array(
                        'type' => 'string',
                        'enum' => array('vs-dark', 'vs-light'),
                        'default' => 'vs-dark'
                    ),
                    'editor_font_size' => array(
                        'type' => 'string',
                        'pattern' => '^[0-9]+$',
                        'default' => '14'
                    ),
                    'editor_line_height' => array(
                        'type' => 'string',
                        'pattern' => '^[0-9]+$',
                        'default' => '20'
                    ),
                    'editor_letter_spacing' => array(
                        'type' => 'string',
                        'pattern' => '^[0-9]+$',
                        'default' => '0'
                    ),
                    'editor_tab_size' => array(
                        'type' => 'string',
                        'pattern' => '^[0-9]+$',
                        'default' => '4'
                    ),
                    'editor_word_wrap' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_line_numbers' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_minimap' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'off'
                    ),
                    'editor_rulers' => array(
                        'type' => 'string',
                        'default' => ''
                    ),
                    'editor_bracket_pair_colorization' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_glyph_margin' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),

                    'editor_line_numbers_minimap' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_scroll_beyond_last_line' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'off'
                    ),
                    'editor_automatic_layout' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_copy_button' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    ),
                    'editor_copy_button_text' => array(
                        'type' => 'string',
                        'default' => 'Copy Code'
                    ),
                    'editor_copy_button_position' => array(
                        'type' => 'string',
                        'enum' => array('top-right', 'top-left', 'bottom-right', 'bottom-left'),
                        'default' => 'top-right'
                    ),
                    'editor_language_display' => array(
                        'type' => 'string',
                        'enum' => array('on', 'off'),
                        'default' => 'on'
                    )
                )
            )
        ));
    }
    
    /**
     * Check if user has permission to access settings
     */
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get all settings
     */
    public function get_settings() {
        $settings = array(
            'editor_theme' => get_option('dblocks_editor_theme', 'vs-dark'),
            'editor_font_size' => get_option('dblocks_editor_font_size', '14'),
            'editor_line_height' => get_option('dblocks_editor_line_height', '20'),
            'editor_letter_spacing' => get_option('dblocks_editor_letter_spacing', '0'),
            'editor_tab_size' => get_option('dblocks_editor_tab_size', '4'),
            'editor_word_wrap' => get_option('dblocks_editor_word_wrap', 'on'),
            'editor_line_numbers' => get_option('dblocks_editor_line_numbers', 'on'),
            'editor_minimap' => get_option('dblocks_editor_minimap', 'off'),
            'editor_rulers' => get_option('dblocks_editor_rulers', ''),
            'editor_bracket_pair_colorization' => get_option('dblocks_editor_bracket_pair_colorization', 'on'),
            'editor_glyph_margin' => get_option('dblocks_editor_glyph_margin', 'on'),

            'editor_line_numbers_minimap' => get_option('dblocks_editor_line_numbers_minimap', 'on'),
            'editor_scroll_beyond_last_line' => get_option('dblocks_editor_scroll_beyond_last_line', 'off'),
            'editor_automatic_layout' => get_option('dblocks_editor_automatic_layout', 'on'),
            'editor_copy_button' => get_option('dblocks_editor_copy_button', 'on'),
            'editor_copy_button_text' => get_option('dblocks_editor_copy_button_text', 'Copy Code'),
            'editor_copy_button_position' => get_option('dblocks_editor_copy_button_position', 'top-right'),
            'editor_language_display' => get_option('dblocks_syntax_display_language', 'on')
        );
        
        return rest_ensure_response($settings);
    }
    
    /**
     * Update settings
     */
    public function update_settings($request) {
        $params = $request->get_params();
        
        // Validate and sanitize each setting
        $settings_to_update = array();
        
        // Editor Theme
        if (isset($params['editor_theme']) && in_array($params['editor_theme'], array('vs-dark', 'vs-light'))) {
            $settings_to_update['dblocks_editor_theme'] = sanitize_text_field($params['editor_theme']);
        }
        
        // Editor Font Size
        if (isset($params['editor_font_size'])) {
            $font_size = intval($params['editor_font_size']);
            if ($font_size >= 8 && $font_size <= 32) {
                $settings_to_update['dblocks_editor_font_size'] = strval($font_size);
            }
        }
        
        // Editor Line Height
        if (isset($params['editor_line_height'])) {
            $line_height = intval($params['editor_line_height']);
            if ($line_height >= 12 && $line_height <= 40) {
                $settings_to_update['dblocks_editor_line_height'] = strval($line_height);
            }
        }
        
        // Editor Letter Spacing
        if (isset($params['editor_letter_spacing'])) {
            $letter_spacing = intval($params['editor_letter_spacing']);
            if ($letter_spacing >= 0 && $letter_spacing <= 10) {
                $settings_to_update['dblocks_editor_letter_spacing'] = strval($letter_spacing);
            }
        }
        
        // Editor Tab Size
        if (isset($params['editor_tab_size'])) {
            $tab_size = intval($params['editor_tab_size']);
            if ($tab_size >= 2 && $tab_size <= 8) {
                $settings_to_update['dblocks_editor_tab_size'] = strval($tab_size);
            }
        }
        
        // Editor Word Wrap
        if (isset($params['editor_word_wrap']) && in_array($params['editor_word_wrap'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_word_wrap'] = sanitize_text_field($params['editor_word_wrap']);
        }
        
        // Editor Line Numbers
        if (isset($params['editor_line_numbers']) && in_array($params['editor_line_numbers'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_line_numbers'] = sanitize_text_field($params['editor_line_numbers']);
        }
        
        // Editor Minimap
        if (isset($params['editor_minimap']) && in_array($params['editor_minimap'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_minimap'] = sanitize_text_field($params['editor_minimap']);
        }
        
        // Editor Rulers
        if (isset($params['editor_rulers'])) {
            $settings_to_update['dblocks_editor_rulers'] = sanitize_text_field($params['editor_rulers']);
        }
        
        // Editor Bracket Pair Colorization
        if (isset($params['editor_bracket_pair_colorization']) && in_array($params['editor_bracket_pair_colorization'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_bracket_pair_colorization'] = sanitize_text_field($params['editor_bracket_pair_colorization']);
        }
        
        // Editor Glyph Margin
        if (isset($params['editor_glyph_margin']) && in_array($params['editor_glyph_margin'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_glyph_margin'] = sanitize_text_field($params['editor_glyph_margin']);
        }
        

        
        // Editor Line Numbers Minimap
        if (isset($params['editor_line_numbers_minimap']) && in_array($params['editor_line_numbers_minimap'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_line_numbers_minimap'] = sanitize_text_field($params['editor_line_numbers_minimap']);
        }
        
        // Editor Scroll Beyond Last Line
        if (isset($params['editor_scroll_beyond_last_line']) && in_array($params['editor_scroll_beyond_last_line'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_scroll_beyond_last_line'] = sanitize_text_field($params['editor_scroll_beyond_last_line']);
        }
        
        // Editor Automatic Layout
        if (isset($params['editor_automatic_layout']) && in_array($params['editor_automatic_layout'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_automatic_layout'] = sanitize_text_field($params['editor_automatic_layout']);
        }
        
        // Editor Copy Button
        if (isset($params['editor_copy_button']) && in_array($params['editor_copy_button'], array('on', 'off'))) {
            $settings_to_update['dblocks_editor_copy_button'] = sanitize_text_field($params['editor_copy_button']);
        }
        
        // Editor Copy Button Text
        if (isset($params['editor_copy_button_text'])) {
            $settings_to_update['dblocks_editor_copy_button_text'] = sanitize_text_field($params['editor_copy_button_text']);
        }
        
        // Editor Copy Button Position
        if (isset($params['editor_copy_button_position'])) {
            $settings_to_update['dblocks_editor_copy_button_position'] = sanitize_text_field($params['editor_copy_button_position']);
        }
        
        // Editor Language Display (Syntax Highlighter)
        if (isset($params['editor_language_display']) && in_array($params['editor_language_display'], array('on', 'off'))) {
            $settings_to_update['dblocks_syntax_display_language'] = sanitize_text_field($params['editor_language_display']);
        }
        
        // Update each setting
        foreach ($settings_to_update as $option_name => $option_value) {
            update_option($option_name, $option_value);
        }
        
        // Return success response with updated settings
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $this->get_settings()
        ));
    }
}

// Initialize the REST API
new DBlocksCodePro_REST_API();
