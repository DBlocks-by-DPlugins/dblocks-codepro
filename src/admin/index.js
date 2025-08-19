import { __ } from '@wordpress/i18n';
import { render } from '@wordpress/element';
import {
    Button,
    SelectControl,
    ToggleControl,
    Notice,
    Spinner,
    RangeControl
} from '@wordpress/components';
import {
    useState,
    useEffect
} from '@wordpress/element';

import CustomPanel from './components/CustomPanel';

import './style.scss';

// Import settings utility
import { DBlocksSettings } from '../global/utils/settings.js';

/**
 * Admin Settings App Component
 */
function AdminSettingsApp() {
    console.log('DBlocks: AdminSettingsApp component initializing...');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [settings, setSettings] = useState(DBlocksSettings.getDefaults());
    const [originalSettings, setOriginalSettings] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    console.log('DBlocks: Component state initialized');

    // Load settings on component mount
    useEffect(() => {
        console.log('DBlocks: Component mounted, loading settings...');
        loadSettings();
    }, []);

    // Check for changes
    useEffect(() => {
        const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setHasChanges(changed);
    }, [settings, originalSettings]);

    /**
     * Load settings from WordPress options
     */
    const loadSettings = async () => {
        try {
            setIsLoading(true);

            // Get settings via REST API
            const restUrl = window.dblocksCodeProSettings?.restUrl || '/wp-json/dblocks-codepro/v1/';
            const response = await fetch(`${restUrl}settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.dblocksCodeProSettings?.nonce || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
                setOriginalSettings(data);
            } else {
                // Fallback to default settings
                console.log('Using default settings');
                setOriginalSettings({ ...settings });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use default settings
            setOriginalSettings({ ...settings });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Save settings to WordPress via REST API (shared utility)
     */
    const saveSettingsToAPI = async (settingsToSave, successMessage = 'Settings saved successfully!') => {
        try {
            setIsSaving(true);
            console.log('DBlocks: Saving settings:', settingsToSave);

            const restUrl = window.dblocksCodeProSettings?.restUrl || '/wp-json/dblocks-codepro/v1/';
            console.log('DBlocks: REST URL:', restUrl);
            console.log('DBlocks: Nonce:', window.dblocksCodeProSettings?.nonce);

            const response = await fetch(`${restUrl}settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.dblocksCodeProSettings?.nonce || ''
                },
                body: JSON.stringify(settingsToSave)
            });

            console.log('DBlocks: Response status:', response.status);
            console.log('DBlocks: Response headers:', response.headers);

            if (response.ok) {
                const data = await response.json();
                console.log('DBlocks: Response data:', data);
                            if (data.success) {
                setNotice({ type: 'success', message: successMessage });
                setOriginalSettings({ ...settingsToSave });
                setHasChanges(false);
                // Use WordPress admin notice instead of Gutenberg
                if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch) {
                    wp.data.dispatch('core/notices').createSuccessNotice(successMessage, { type: 'snackbar' });
                }
                return true;
            } else {
                setNotice({ type: 'error', message: data.message || 'Failed to save settings' });
                // Use WordPress admin notice instead of Gutenberg
                if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch) {
                    wp.data.dispatch('core/notices').createErrorNotice('Failed to save settings', { type: 'snackbar' });
                }
                return false;
            }
            } else {
                const errorText = await response.text();
                console.error('DBlocks: Response error text:', errorText);
                setNotice({ type: 'error', message: `Failed to save settings: ${response.status} ${response.statusText}` });
                // Use WordPress admin notice instead of Gutenberg
                if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch) {
                    wp.data.dispatch('core/notices').createErrorNotice('Failed to save settings', { type: 'snackbar' });
                }
                return false;
            }
        } catch (error) {
            console.error('DBlocks: Failed to save settings:', error);
            setNotice({ type: 'error', message: 'Failed to save settings: ' + error.message });
            // Use WordPress admin notice instead of Gutenberg
            if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch) {
                wp.data.dispatch('core/notices').createErrorNotice('Failed to save settings', { type: 'snackbar' });
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Save current settings to WordPress
     */
    const saveSettings = async () => {
        await saveSettingsToAPI(settings);
    };

    /**
     * Reset settings to defaults
     */
    const resetToDefaults = async () => {
        if (!confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
            return;
        }

        const defaults = DBlocksSettings.getDefaults();

        setSettings(defaults);
        setHasChanges(true);

        // Automatically save the reset settings using shared utility
        await saveSettingsToAPI(defaults, 'Settings reset to defaults and saved successfully!');
    };

    /**
     * Update a setting value
     */
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    /**
     * Dismiss notice
     */
    const dismissNotice = () => {
        setNotice(null);
    };

    if (isLoading) {
        return (
            <div className="dblocks-admin-loading">
                <Spinner />
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="dblocks-admin-app">
            {notice && (
                <Notice
                    status={notice.type}
                    isDismissible={true}
                    onDismiss={dismissNotice}
                    style={{ marginBottom: '20px' }}
                >
                    {notice.message}
                </Notice>
            )}

            <CustomPanel title={__('Editor Settings', 'dblocks-codepro')}>
                
                <SelectControl
                    label="Theme"
                    value={settings.editor_theme}
                    options={[
                        { label: 'Dark', value: 'vs-dark' },
                        { label: 'Light', value: 'vs-light' }
                    ]}
                    onChange={(value) => updateSetting('editor_theme', value)}
                />

                <RangeControl
                    label="Font Size"
                    value={parseInt(settings.editor_font_size)}
                    onChange={(value) => updateSetting('editor_font_size', value.toString())}
                    min={8}
                    max={32}
                    step={1}
                    help="Font size in pixels"
                />

                <RangeControl
                    label="Line Height"
                    value={parseInt(settings.editor_line_height)}
                    onChange={(value) => updateSetting('editor_line_height', value.toString())}
                    min={12}
                    max={40}
                    step={1}
                    help="Line height in pixels"
                />

                <RangeControl
                    label="Letter Spacing"
                    value={parseInt(settings.editor_letter_spacing)}
                    onChange={(value) => updateSetting('editor_letter_spacing', value.toString())}
                    min={0}
                    max={10}
                    step={1}
                    help="Letter spacing in pixels"
                />

                <RangeControl
                    label="Tab Size"
                    value={parseInt(settings.editor_tab_size)}
                    onChange={(value) => updateSetting('editor_tab_size', value.toString())}
                    min={1}
                    max={16}
                    step={1}
                    help="Number of spaces for tab indentation"
                />

                <ToggleControl
                    label="Word Wrap"
                    checked={settings.editor_word_wrap === 'on'}
                    onChange={(value) => updateSetting('editor_word_wrap', value ? 'on' : 'off')}
                    help="Wrap long lines"
                />

                <ToggleControl
                    label="Line Numbers"
                    checked={settings.editor_line_numbers === 'on'}
                    onChange={(value) => updateSetting('editor_line_numbers', value ? 'on' : 'off')}
                    help="Show line numbers"
                />

                <ToggleControl
                    label="Glyph Margin"
                    checked={settings.editor_glyph_margin === 'on'}
                    onChange={(value) => updateSetting('editor_glyph_margin', value ? 'on' : 'off')}
                    help="Show glyph margin for breakpoints"
                />
            </CustomPanel>

            <CustomPanel title={__('Syntax Highlighter Settings', 'dblocks-codepro')}>
                <ToggleControl
                    label="Copy Button"
                    checked={settings.editor_copy_button === 'on'}
                    onChange={(value) => updateSetting('editor_copy_button', value ? 'on' : 'off')}
                    help="Show copy button on code blocks"
                />
                <ToggleControl
                    label="Language Display"
                    checked={settings.editor_language_display === 'on'}
                    onChange={(value) => updateSetting('editor_language_display', value ? 'on' : 'off')}
                    help="Show language display on code blocks"
                />
            </CustomPanel>

            {/* Action Buttons */}
            <div className="dblocks-admin-actions">
                <Button
                    isPrimary
                    onClick={saveSettings}
                    disabled={!hasChanges || isSaving}
                    isBusy={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                    isSecondary
                    onClick={resetToDefaults}
                    disabled={isSaving}
                >
                    Reset to Defaults
                </Button>
            </div>
        </div >
    );
}

// Render the app
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('dblocks-admin-app');
    if (container) {
        try {
            // Check if React and WordPress components are available
            if (typeof wp === 'undefined' || typeof wp.element === 'undefined') {
                throw new Error('WordPress React dependencies not loaded. Please refresh the page.');
            }

            console.log('DBlocks: WordPress React dependencies available:', {
                wp: typeof wp !== 'undefined',
                element: typeof wp.element !== 'undefined',
                components: typeof wp.components !== 'undefined'
            });

            render(<AdminSettingsApp />, container);
        } catch (error) {
            console.error('Failed to render DBlocks admin app:', error);
            container.innerHTML = `
                <div class="notice notice-error">
                    <p><strong>Failed to load DBlocks Code Pro settings.</strong></p>
                    <p>Error: ${error.message}</p>
                    <p>Please refresh the page or contact support if the issue persists.</p>
                </div>
            `;
        }
    } else {
        console.warn('DBlocks admin container not found');
    }
});