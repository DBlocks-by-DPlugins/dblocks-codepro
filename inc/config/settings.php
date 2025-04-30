<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Plugin settings configuration
 */
return array(
    array(
        'route' => '/theme/',
        'option_name' => 'dblocks_codepro_theme',
        'default_value' => 'vs-light',
        'post_param_name' => 'theme',
    ),
    array(
        'route' => '/syntax-theme/',
        'option_name' => 'dblocks_codepro_syntax_theme',
        'default_value' => 'light',
        'post_param_name' => 'syntaxTheme',
    ),
    array(
        'route' => '/editor-font-size/',
        'option_name' => 'dblocks_codepro_editor_font_size',
        'default_value' => '14px',
        'post_param_name' => 'editorFontSize',
    ),
    array(
        'route' => '/display-language/',
        'option_name' => 'dblocks_codepro_display_language',
        'default_value' => 'true',
        'post_param_name' => 'displayLanguage',
    ),
    array(
        'route' => '/copy-button/',
        'option_name' => 'dblocks_codepro_copy_button',
        'default_value' => 'true',
        'post_param_name' => 'copyButton',
    ),
); 