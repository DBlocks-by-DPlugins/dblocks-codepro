<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * DBlocks Code Pro Admin Settings Page
 */
class DBlocksCodePro_Admin_Settings {
    
    private $page_slug = 'dblocks-codepro-settings';
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_filter('plugin_action_links_' . DBLOCKS_CODEPRO_BASE, array($this, 'add_plugin_action_links'));
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
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our settings page
        if (strpos($hook, $this->page_slug) === false) {
            return;
        }
        
        // Enqueue WordPress admin components
        wp_enqueue_script('wp-element');
        wp_enqueue_script('wp-components');
        wp_enqueue_script('wp-api-fetch');
        wp_enqueue_script('wp-i18n');
        
        // Enqueue our settings page script
        wp_enqueue_script(
            'dblocks-codepro-settings',
            DBLOCKS_CODEPRO_URL . 'build/admin-settings.js',
            array('wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n'),
            filemtime(DBLOCKS_CODEPRO_PATH . 'build/admin-settings.js'),
            true
        );
        
        // Enqueue WordPress admin styles
        wp_enqueue_style('wp-components');
        
        // Enqueue our custom admin settings styles
        wp_enqueue_style(
            'dblocks-codepro-admin-settings',
            DBLOCKS_CODEPRO_URL . 'build/admin-settings.css',
            array('wp-components'),
            filemtime(DBLOCKS_CODEPRO_PATH . 'build/admin-settings.css')
        );
        
        // Localize script with REST API data
        wp_localize_script('dblocks-codepro-settings', 'dBlocksAdmin', array(
            'restUrl' => rest_url('dblocks_codepro/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'pluginUrl' => DBLOCKS_CODEPRO_URL,
        ));
    }
    
    /**
     * Add Settings link to plugins list
     */
    public function add_plugin_action_links($links) {
        $settings_link = sprintf(
            '<a href="%s" class="dblocks-settings-link">%s</a>',
            admin_url('themes.php?page=' . $this->page_slug),
            __('Settings', 'dblocks-codepro')
        );
        
        // Add Settings link before Deactivate
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
            <div id="dblocks-codepro-settings-root"></div>
        </div>
        <?php
    }
}

// Initialize the admin settings
new DBlocksCodePro_Admin_Settings();
