<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * DBlocks Code Pro Admin Settings Page
 */
class DBlocksCodePro_Admin_Settings {
    private $page_slug = 'dblocks-codepro-settings';
    
    // Validation constants
    private const FONT_SIZE_MIN = 8;
    private const FONT_SIZE_MAX = 32;
    private const LINE_HEIGHT_MIN = 12;
    private const LINE_HEIGHT_MAX = 40;
    private const LETTER_SPACING_MIN = 0;
    private const LETTER_SPACING_MAX = 10;
    private const TAB_SIZE_MIN = 2;
    private const TAB_SIZE_MAX = 8;
    
    // Default settings
    private $default_settings = array(
        // Editor Settings
        'dblocks_editor_theme' => 'light',
        'dblocks_editor_line_numbers' => 'on',
        'dblocks_editor_font_size' => '14',
        'dblocks_editor_line_height' => '20',
        'dblocks_editor_letter_spacing' => '0',
        'dblocks_editor_tab_size' => '4',
        'dblocks_editor_word_wrap' => 'off',
        
        // Syntax Highlighter Settings
        'dblocks_syntax_display_language' => 'on',
        'dblocks_syntax_copy_button' => 'on'
    );
    
    /**
     * Constructor
     */
    public function __construct() {
		// Add AJAX handlers
		add_action('wp_ajax_dblocks_reset_settings', array($this, 'ajax_reset_settings'));
		add_action('wp_ajax_dblocks_save_settings', array($this, 'ajax_save_settings'));
		
		// Add admin menu
		add_action('admin_menu', array($this, 'add_admin_menu'));
		add_action('admin_init', array($this, 'register_settings'));
		
		// Add settings link to plugins page
		add_filter('plugin_action_links_' . DBLOCKS_CODEPRO_BASE, array($this, 'add_settings_link'));
	}
    
    /**
     * Initialize default settings
     */
    public function init_default_settings() {
        foreach ($this->default_settings as $option_name => $default_value) {
            if (get_option($option_name) === false) {
                add_option($option_name, $default_value);
            }
        }
    }
    
    /**
     * Register all settings
     */
    public function register_settings() {
        // Editor Settings Section
        add_settings_section(
            'dblocks_editor_settings',
            __('Editor Settings', 'dblocks-codepro'),
            array($this, 'editor_settings_section_callback'),
            $this->page_slug
        );
        
        // Syntax Highlighter Settings Section
        add_settings_section(
            'dblocks_syntax_settings',
            __('Syntax Highlighter Settings', 'dblocks-codepro'),
            array($this, 'syntax_settings_section_callback'),
            $this->page_slug
        );
        
        // Register Editor Settings
        register_setting($this->page_slug, 'dblocks_editor_theme');
        register_setting($this->page_slug, 'dblocks_editor_line_numbers');
        register_setting($this->page_slug, 'dblocks_editor_font_size');
        register_setting($this->page_slug, 'dblocks_editor_line_height');
        register_setting($this->page_slug, 'dblocks_editor_letter_spacing');
        register_setting($this->page_slug, 'dblocks_editor_tab_size');
        register_setting($this->page_slug, 'dblocks_editor_word_wrap');
        
        // Register Syntax Highlighter Settings
        register_setting($this->page_slug, 'dblocks_syntax_display_language');
        register_setting($this->page_slug, 'dblocks_syntax_copy_button');
        
        // Add Editor Settings Fields
        add_settings_field(
            'dblocks_editor_theme',
            __('Theme', 'dblocks-codepro'),
            array($this, 'theme_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_line_numbers',
            __('Line Numbers', 'dblocks-codepro'),
            array($this, 'line_numbers_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_font_size',
            __('Font Size (px)', 'dblocks-codepro'),
            array($this, 'font_size_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_line_height',
            __('Line Height (px)', 'dblocks-codepro'),
            array($this, 'line_height_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_letter_spacing',
            __('Letter Spacing (px)', 'dblocks-codepro'),
            array($this, 'letter_spacing_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_tab_size',
            __('Tab Size', 'dblocks-codepro'),
            array($this, 'tab_size_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        add_settings_field(
            'dblocks_editor_word_wrap',
            __('Word Wrap', 'dblocks-codepro'),
            array($this, 'word_wrap_field_callback'),
            $this->page_slug,
            'dblocks_editor_settings'
        );
        
        // Add Syntax Highlighter Settings Fields
        add_settings_field(
            'dblocks_syntax_display_language',
            __('Display Language', 'dblocks-codepro'),
            array($this, 'display_language_field_callback'),
            $this->page_slug,
            'dblocks_syntax_settings'
        );
        
        add_settings_field(
            'dblocks_syntax_copy_button',
            __('Copy Code Button', 'dblocks-codepro'),
            array($this, 'copy_button_field_callback'),
            $this->page_slug,
            'dblocks_syntax_settings'
        );
    }
    
    /**
     * Editor Settings Section Callback
     */
    public function editor_settings_section_callback() {
        echo '<div class="dblocks-settings-section">';
        echo '<p>' . __('Configure the Monaco editor appearance and behavior.', 'dblocks-codepro') . '</p>';
        echo '</div>';
    }
    
    /**
     * Syntax Settings Section Callback
     */
    public function syntax_settings_section_callback() {
        echo '<div class="dblocks-settings-section">';
        echo '<p>' . __('Configure syntax highlighter display options.', 'dblocks-codepro') . '</p>';
        echo '</div>';
    }
    
    /**
     * Theme Field Callback
     */
    public function theme_field_callback() {
        $value = get_option('dblocks_editor_theme', 'light');
        ?>
        <select name="dblocks_editor_theme">
            <option value="light" <?php selected($value, 'light'); ?>><?php _e('Light', 'dblocks-codepro'); ?></option>
            <option value="dark" <?php selected($value, 'dark'); ?>><?php _e('Dark', 'dblocks-codepro'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Line Numbers Field Callback
     */
    public function line_numbers_field_callback() {
        $value = get_option('dblocks_editor_line_numbers', 'on');
        ?>
        <select name="dblocks_editor_line_numbers">
            <option value="on" <?php selected($value, 'on'); ?>><?php _e('On', 'dblocks-codepro'); ?></option>
            <option value="off" <?php selected($value, 'off'); ?>><?php _e('Off', 'dblocks-codepro'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Font Size Field Callback
     */
    public function font_size_field_callback() {
        $value = get_option('dblocks_editor_font_size', '14');
        ?>
        <input type="number" name="dblocks_editor_font_size" value="<?php echo esc_attr($value); ?>" min="<?php echo self::FONT_SIZE_MIN; ?>" max="<?php echo self::FONT_SIZE_MAX; ?>" step="1" /> px
        <?php
    }
    
    /**
     * Line Height Field Callback
     */
    public function line_height_field_callback() {
        $value = get_option('dblocks_editor_line_height', '20');
        ?>
        <input type="number" name="dblocks_editor_line_height" value="<?php echo esc_attr($value); ?>" min="<?php echo self::LINE_HEIGHT_MIN; ?>" max="<?php echo self::LINE_HEIGHT_MAX; ?>" step="1" /> px
        <?php
    }
    
    /**
     * Letter Spacing Field Callback
     */
    public function letter_spacing_field_callback() {
        $value = get_option('dblocks_editor_letter_spacing', '0');
        ?>
        <input type="number" name="dblocks_editor_letter_spacing" value="<?php echo esc_attr($value); ?>" min="<?php echo self::LETTER_SPACING_MIN; ?>" max="<?php echo self::LETTER_SPACING_MAX; ?>" step="1" /> px
        <?php
    }
    
    /**
     * Tab Size Field Callback
     */
    public function tab_size_field_callback() {
        $value = get_option('dblocks_editor_tab_size', '4');
        ?>
        <input type="number" name="dblocks_editor_tab_size" value="<?php echo esc_attr($value); ?>" min="<?php echo self::TAB_SIZE_MIN; ?>" max="<?php echo self::TAB_SIZE_MAX; ?>" step="1" />
        <?php
    }
    
    /**
     * Word Wrap Field Callback
     */
    public function word_wrap_field_callback() {
        $value = get_option('dblocks_editor_word_wrap', 'off');
        ?>
        <select name="dblocks_editor_word_wrap">
            <option value="on" <?php selected($value, 'on'); ?>><?php _e('On', 'dblocks-codepro'); ?></option>
            <option value="off" <?php selected($value, 'off'); ?>><?php _e('Off', 'dblocks-codepro'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Display Language Field Callback
     */
    public function display_language_field_callback() {
        $value = get_option('dblocks_syntax_display_language', 'on');
        ?>
        <select name="dblocks_syntax_display_language">
            <option value="on" <?php selected($value, 'on'); ?>><?php _e('On', 'dblocks-codepro'); ?></option>
            <option value="off" <?php selected($value, 'off'); ?>><?php _e('Off', 'dblocks-codepro'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Copy Button Field Callback
     */
    public function copy_button_field_callback() {
        $value = get_option('dblocks_syntax_copy_button', 'on');
        ?>
        <select name="dblocks_syntax_copy_button">
            <option value="on" <?php selected($value, 'on'); ?>><?php _e('On', 'dblocks-codepro'); ?></option>
            <option value="off" <?php selected($value, 'off'); ?>><?php _e('Off', 'dblocks-codepro'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Add admin menu under Appearance
     */
    public function add_admin_menu() {
        add_theme_page(
            __('DBlocks Settings', 'dblocks-codepro'),
            __('DBlocks', 'dblocks-codepro'),
            'manage_options',
            $this->page_slug,
            array($this, 'admin_page_html')
        );
    }

    /**
     * Add Settings link to plugins list
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('themes.php?page=' . $this->page_slug) . '">' . __('Settings', 'dblocks-codepro') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Admin page HTML
     */
    public function admin_page_html() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div id="dblocks-admin-app">
                <!-- React admin app will be rendered here -->
                <div class="dblocks-admin-loading">
                    <p>Loading DBlocks Code Pro Settings...</p>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get all settings with their current values
     */
    public static function get_all_settings() {
        return array(
            'editor_theme' => get_option('dblocks_editor_theme', 'vs-dark'),
            'editor_font_size' => get_option('dblocks_editor_font_size', '14'),
            'editor_line_height' => get_option('dblocks_editor_line_height', '1.5'),
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
            'fontSizeMin' => self::FONT_SIZE_MIN,
            'fontSizeMax' => self::FONT_SIZE_MAX,
            'lineHeightMin' => self::LINE_HEIGHT_MIN,
            'lineHeightMax' => self::LINE_HEIGHT_MAX,
            'letterSpacingMin' => self::LETTER_SPACING_MIN,
            'letterSpacingMax' => self::LETTER_SPACING_MAX,
            'tabSizeMin' => self::TAB_SIZE_MIN,
            'tabSizeMax' => self::TAB_SIZE_MAX
        );
    }
    
    /**
     * AJAX handler for resetting settings to defaults
     */
    public function ajax_reset_settings() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'dblocks_settings_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Get the settings to reset
        $settings = $_POST['settings'];
        
        if (!is_array($settings)) {
            wp_send_json_error('Invalid settings data');
        }
        
        // Reset each setting to its default value
        foreach ($settings as $setting_name => $default_value) {
            update_option($setting_name, $default_value);
        }
        
        wp_send_json_success('Settings reset successfully');
    }
    
    /**
     * AJAX handler for saving settings
     */
    public function ajax_save_settings() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'dblocks_settings_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Get form data
        $form_data = $_POST;
        
        // Define the settings we want to save
        $settings_to_save = array(
            'dblocks_editor_theme',
            'dblocks_editor_font_size',
            'dblocks_editor_line_height',
            'dblocks_editor_letter_spacing',
            'dblocks_editor_tab_size',
            'dblocks_editor_word_wrap',
            'dblocks_editor_line_numbers',
            'dblocks_editor_minimap',
            'dblocks_editor_rulers',
            'dblocks_editor_bracket_pair_colorization',
            'dblocks_editor_glyph_margin',
            'dblocks_editor_line_numbers_minimap',
            'dblocks_editor_scroll_beyond_last_line',
            'dblocks_editor_automatic_layout',
            'dblocks_editor_copy_button',
            'dblocks_editor_copy_button_text',
            'dblocks_editor_copy_button_position'
        );
        
        // Save each setting
        foreach ($settings_to_save as $setting_name) {
            if (isset($form_data[$setting_name])) {
                $value = $form_data[$setting_name];
                
                // Handle checkbox values
                if (in_array($setting_name, array(
                    'dblocks_editor_word_wrap',
                    'dblocks_editor_line_numbers',
                    'dblocks_editor_minimap',
                    'dblocks_editor_bracket_pair_colorization',
                    'dblocks_editor_glyph_margin',
                    'dblocks_editor_line_numbers_minimap',
                    'dblocks_editor_scroll_beyond_last_line',
                    'dblocks_editor_automatic_layout',
                    'dblocks_editor_copy_button'
                ))) {
                    $value = $value ? 'on' : 'off';
                }
                
                update_option($setting_name, $value);
            }
        }
        
        wp_send_json_success('Settings saved successfully');
    }
    
    /**
     * Localize settings for scripts
     */
    public static function localize_settings($handle) {
        wp_localize_script($handle, 'dblocksCodeProSettings', self::get_all_settings());
    }
}

// Initialize the admin settings
new DBlocksCodePro_Admin_Settings();

/**
 * Localize settings for admin settings page
 */
function dblocks_codepro_localize_settings($hook) {
    // Only load on our specific admin page
    if ($hook === 'appearance_page_dblocks-codepro-settings') {
        // Ensure Gutenberg is loaded (needed for wp-data stores)
        wp_enqueue_script('wp-block-editor');
        wp_enqueue_script('wp-format-library');
        
        // Load React admin app using the generated asset file
        $asset_file = plugin_dir_path(dirname(__FILE__)) . 'build/admin/index.asset.php';
        if (file_exists($asset_file)) {
            $asset = require $asset_file;
            wp_enqueue_script(
                'dblocks-admin-app', 
                plugin_dir_url(dirname(__FILE__)) . 'build/admin/index.js', 
                $asset['dependencies'], 
                $asset['version'], 
                true
            );
        } else {
            wp_die('DBlocks Code Pro: Admin asset file not found. Please rebuild the plugin.');
        }

        // Enqueue WordPress admin styles
        wp_enqueue_style('wp-components');
        
        // Enqueue our admin styles
        wp_enqueue_style(
            'dblocks-admin-styles',
            plugin_dir_url(dirname(__FILE__)) . 'build/admin/style-index.css',
            array('wp-components'),
            $asset['version']
        );
        
        // Localize settings
        wp_localize_script('dblocks-admin-app', 'dblocksCodeProSettings', array(
            'restUrl' => rest_url('dblocks-codepro/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'settings' => DBlocksCodePro_Admin_Settings::get_all_settings()
        ));
    }
}
add_action('admin_enqueue_scripts', 'dblocks_codepro_localize_settings');
