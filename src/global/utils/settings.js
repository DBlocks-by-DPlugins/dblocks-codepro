/**
 * DBlocks Code Pro Unified Settings Utility
 * Provides consistent access to plugin settings for both admin and frontend
 */

import { DEFAULT_SETTINGS } from '../conts/defaultSettings.js';

/**
 * DBlocks Settings Manager
 */
export const DBlocksSettings = {

    /**
     * Get default settings
     */
    getDefaults() {
        return { ...DEFAULT_SETTINGS };
    },

    /**
     * Get all current settings (merged with defaults)
     */
    getAll() {
        const currentSettings = window.dblocksCodeProSettings || {};
        return { ...DEFAULT_SETTINGS, ...currentSettings };
    },

    /**
     * Get a specific setting with fallback to default
     */
    get(key, fallback = null) {
        const settings = this.getAll();
        return settings[key] !== undefined ? settings[key] : fallback;
    },



    /**
     * Get Monaco editor options based on current settings
     */
    getMonacoOptions(overrides = {}) {
        const baseOptions = {
            theme: this.get('editor_theme'),
            lineNumbers: this.get('editor_line_numbers'),
            fontSize: parseInt(this.get('editor_font_size')),
            lineHeight: parseInt(this.get('editor_line_height')),
            letterSpacing: parseInt(this.get('editor_letter_spacing')),
            tabSize: parseInt(this.get('editor_tab_size')),
            wordWrap: this.get('editor_word_wrap'),
            minimap: { enabled: false },
            scrollBeyondLastLine: this.get('editor_scroll_beyond_last_line') === 'on',
            automaticLayout: this.get('editor_automatic_layout') === 'on',
            glyphMargin: this.get('editor_glyph_margin') === 'on',
            folding: false,
            scrollbar: {
                alwaysConsumeMouseWheel: false
            },

            bracketPairColorization: true,
            rulers: this.get('editor_rulers') ? this.get('editor_rulers').split(',').map(r => parseInt(r.trim())) : []
        };

        return { ...baseOptions, ...overrides };
    },

    /**
     * Check if a setting is enabled
     */
    isEnabled(setting) {
        return this.get(setting) === 'on';
    },

    /**
     * Get numeric setting value
     */
    getNumeric(setting) {
        return parseInt(this.get(setting)) || 0;
    },

    /**
     * Validate settings
     */
    validate() {
        const settings = this.getAll();
        const errors = [];

        // Validate font size
        const fontSize = parseInt(settings.editor_font_size);
        if (fontSize < 8 || fontSize > 32) {
            errors.push('Font size must be between 8 and 32 pixels');
        }

        // Validate line height
        const lineHeight = parseInt(settings.editor_line_height);
        if (lineHeight < 12 || lineHeight > 40) {
            errors.push('Line height must be between 12 and 40 pixels');
        }

        // Validate letter spacing
        const letterSpacing = parseInt(settings.editor_letter_spacing);
        if (letterSpacing < 0 || letterSpacing > 10) {
            errors.push('Letter spacing must be between 0 and 10 pixels');
        }

        // Validate tab size
        const tabSize = parseInt(settings.editor_tab_size);
        if (tabSize < 1 || tabSize > 16) {
            errors.push('Tab size must be between 1 and 16 spaces');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Get settings summary for debugging
     */
    getSummary() {
        return {
            editor: {
                theme: this.get('editor_theme'),
                lineNumbers: this.get('editor_line_numbers'),
                fontSize: this.get('editor_font_size') + 'px',
                lineHeight: this.get('editor_line_height') + 'px',
                letterSpacing: this.get('editor_letter_spacing') + 'px',
                tabSize: this.get('editor_tab_size'),
                wordWrap: this.get('editor_word_wrap')
            },
            copyButton: {
                enabled: this.get('editor_copy_button')
            },
            validation: this.validate()
        };
    }
};
