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
    array(
        'route' => '/display-row-numbers/',
        'option_name' => 'dblocks_codepro_display_row_numbers',
        'default_value' => 'false',
        'post_param_name' => 'displayRowNumbers',
    ),
    array(
        'route' => '/indent-width/',
        'option_name' => 'dblocks_codepro_indent_width',
        'default_value' => '4px',
        'post_param_name' => 'indentWidth',
    ),
    array(
        'route' => '/font-size/',
        'option_name' => 'dblocks_codepro_font_size',
        'default_value' => '14px',
        'post_param_name' => 'fontSize',
    ),
    array(
        'route' => '/line-height/',
        'option_name' => 'dblocks_codepro_line_height',
        'default_value' => '20px',
        'post_param_name' => 'lineHeight',
    ),
    array(
        'route' => '/letter-spacing/',
        'option_name' => 'dblocks_codepro_letter_spacing',
        'default_value' => '0px',
        'post_param_name' => 'letterSpacing',
    ),
    array(
        'route' => '/word-wrap/',
        'option_name' => 'dblocks_codepro_word_wrap',
        'default_value' => 'false',
        'post_param_name' => 'wordWrap',
    ),
    array(
        'route' => '/auto-resize-height/',
        'option_name' => 'dblocks_codepro_auto_resize_height',
        'default_value' => 'false',
        'post_param_name' => 'autoResizeHeight',
    ),
); 