import { render, useState, useEffect } from '@wordpress/element';
import { 
    Panel, 
    PanelBody, 
    SelectControl, 
    ToggleControl,
    Button,
    Notice,
    __experimentalUnitControl as UnitControl,
    __experimentalSpacer as Spacer,
    Icon
} from '@wordpress/components';
import { edit, code } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

// Import tab components
import EditorTab from './tabs/EditorTab';
import SyntaxTab from './tabs/SyntaxTab';

const AdminSettings = () => {
    // ========================================
    // STATE MANAGEMENT
    // ========================================
    const [settings, setSettings] = useState({
        theme: 'vs-light',
        syntaxTheme: 'light',
        editorFontSize: '14px',
        displayLanguage: true,
        copyButton: true,
        displayRowNumbers: false,
        indentWidth: '4px',
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0px',
        wordWrap: false,
        autoResizeHeight: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);

    // ========================================
    // CONSTANTS & OPTIONS
    // ========================================
    const THEME_OPTIONS = [
        { label: __('Light', 'dblocks-codepro'), value: 'vs-light' },
        { label: __('Dark', 'dblocks-codepro'), value: 'vs-dark' }
    ];

    const SYNTAX_THEME_OPTIONS = [
        { label: __('Light', 'dblocks-codepro'), value: 'light' },
        { label: __('Dark', 'dblocks-codepro'), value: 'dark' }
    ];

    // ========================================
    // EFFECTS
    // ========================================
    useEffect(() => {
        loadSettings();
    }, []);

    // ========================================
    // API FUNCTIONS
    // ========================================
    const loadSettings = async () => {
        setLoading(true);
        try {
            const [theme, syntaxTheme, fontSize, displayLang, copyBtn, displayRowNumbers, indentWidth, syntaxFontSize, lineHeight, letterSpacing, wordWrap, autoResizeHeight] = await Promise.all([
                apiFetch({ path: '/dblocks_codepro/v1/theme/' }),
                apiFetch({ path: '/dblocks_codepro/v1/syntax-theme/' }),
                apiFetch({ path: '/dblocks_codepro/v1/editor-font-size/' }),
                apiFetch({ path: '/dblocks_codepro/v1/display-language/' }),
                apiFetch({ path: '/dblocks_codepro/v1/copy-button/' }),
                apiFetch({ path: '/dblocks_codepro/v1/display-row-numbers/' }),
                apiFetch({ path: '/dblocks_codepro/v1/indent-width/' }),
                apiFetch({ path: '/dblocks_codepro/v1/font-size/' }),
                apiFetch({ path: '/dblocks_codepro/v1/line-height/' }),
                apiFetch({ path: '/dblocks_codepro/v1/letter-spacing/' }),
                apiFetch({ path: '/dblocks_codepro/v1/word-wrap/' }),
                apiFetch({ path: '/dblocks_codepro/v1/auto-resize-height/' })
            ]);

            setSettings({
                theme: theme,
                syntaxTheme: syntaxTheme,
                editorFontSize: fontSize,
                displayLanguage: displayLang === 'true',
                copyButton: copyBtn === 'true',
                displayRowNumbers: displayRowNumbers === 'true',
                indentWidth: indentWidth || '4px',
                fontSize: syntaxFontSize || '14px',
                lineHeight: lineHeight || '20px',
                letterSpacing: letterSpacing || '0px',
                wordWrap: wordWrap === 'true',
                autoResizeHeight: autoResizeHeight === 'true'
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
            showNotice(__('Failed to load settings', 'dblocks-codepro'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await Promise.all([
                apiFetch({
                    path: '/dblocks_codepro/v1/theme/',
                    method: 'POST',
                    data: { theme: settings.theme }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/syntax-theme/',
                    method: 'POST',
                    data: { syntaxTheme: settings.syntaxTheme }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/editor-font-size/',
                    method: 'POST',
                    data: { editorFontSize: settings.editorFontSize }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/display-language/',
                    method: 'POST',
                    data: { displayLanguage: settings.displayLanguage }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/copy-button/',
                    method: 'POST',
                    data: { copyButton: settings.copyButton }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/display-row-numbers/',
                    method: 'POST',
                    data: { displayRowNumbers: settings.displayRowNumbers }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/indent-width/',
                    method: 'POST',
                    data: { indentWidth: settings.indentWidth }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/font-size/',
                    method: 'POST',
                    data: { fontSize: settings.fontSize }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/line-height/',
                    method: 'POST',
                    data: { lineHeight: settings.lineHeight }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/letter-spacing/',
                    method: 'POST',
                    data: { letterSpacing: settings.letterSpacing }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/word-wrap/',
                    method: 'POST',
                    data: { wordWrap: settings.wordWrap }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/auto-resize-height/',
                    method: 'POST',
                    data: { autoResizeHeight: settings.autoResizeHeight }
                })
            ]);

            showNotice(__('Settings saved successfully!', 'dblocks-codepro'), 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showNotice(__('Failed to save settings', 'dblocks-codepro'), 'error');
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    const showNotice = (message, type) => {
        setNotice({ message, type });
        setTimeout(() => setNotice(null), 4000);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // ========================================
    // RESET FUNCTION
    // ========================================
    const resetToDefaults = async () => {
        const defaultSettings = {
            theme: 'vs-light',
            syntaxTheme: 'light',
            editorFontSize: '14px',
            displayLanguage: true,
            copyButton: true,
            displayRowNumbers: false,
            indentWidth: '4px',
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0px',
            wordWrap: false
        };

        setSaving(true);
        try {
            // Save default values to the database
            await Promise.all([
                apiFetch({
                    path: '/dblocks_codepro/v1/theme/',
                    method: 'POST',
                    data: { theme: defaultSettings.theme }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/syntax-theme/',
                    method: 'POST',
                    data: { syntaxTheme: defaultSettings.syntaxTheme }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/editor-font-size/',
                    method: 'POST',
                    data: { editorFontSize: defaultSettings.editorFontSize }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/display-language/',
                    method: 'POST',
                    data: { displayLanguage: defaultSettings.displayLanguage }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/copy-button/',
                    method: 'POST',
                    data: { copyButton: defaultSettings.copyButton }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/display-row-numbers/',
                    method: 'POST',
                    data: { displayRowNumbers: defaultSettings.displayRowNumbers }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/indent-width/',
                    method: 'POST',
                    data: { indentWidth: defaultSettings.indentWidth }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/font-size/',
                    method: 'POST',
                    data: { fontSize: defaultSettings.fontSize }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/line-height/',
                    method: 'POST',
                    data: { lineHeight: defaultSettings.lineHeight }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/letter-spacing/',
                    method: 'POST',
                    data: { letterSpacing: defaultSettings.letterSpacing }
                }),
                apiFetch({
                    path: '/dblocks_codepro/v1/word-wrap/',
                    method: 'POST',
                    data: { wordWrap: defaultSettings.wordWrap }
                })
            ]);

            // Update local state
            setSettings(defaultSettings);
            showNotice(__('Settings reset to defaults successfully!', 'dblocks-codepro'), 'success');
        } catch (error) {
            console.error('Failed to reset settings to defaults:', error);
            showNotice(__('Failed to reset settings to defaults', 'dblocks-codepro'), 'error');
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // TAB CONFIGURATION
    // ========================================
    const [activeTab, setActiveTab] = useState('editor');

    const tabs = [
        {
            name: 'editor',
            title: __('Advanced Custom HTML', 'dblocks-codepro'),
            className: 'tab-editor'
        },
        {
            name: 'syntax',
            title: __('Syntax Highlighter', 'dblocks-codepro'),
            className: 'tab-syntax'
        }
    ];

    // ========================================
    // MAIN RENDER
    // ========================================
    if (loading) {
        return <div>{__('Loading settings...', 'dblocks-codepro')}</div>;
    }

    return (
        <div>
            {/* Notice Display */}
            {notice && (
                <Notice
                    status={notice.type}
                    isDismissible={true}
                    onDismiss={() => setNotice(null)}
                    style={{ marginBottom: '20px' }}
                >
                    {notice.message}
                </Notice>
            )}

            {/* Main Layout */}
            <div id="dblocks-codepro-settings-main">
                {/* Tab Navigation Sidebar */}
                <div id="dblocks-codepro-settings-sidebar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`dblocks-codepro-settings-tab ${activeTab === tab.name ? 'active' : ''}`}
                            style={{
                                transition: 'all 0.15s ease-in-out'
                            }}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div id="dblocks-codepro-settings-content">
                    {/* Render Active Tab Content */}
                    {activeTab === 'editor' ? (
                        <EditorTab 
                            settings={settings}
                            updateSetting={updateSetting}
                            THEME_OPTIONS={THEME_OPTIONS}
                        />
                    ) : (
                        <SyntaxTab 
                            settings={settings}
                            updateSetting={updateSetting}
                            SYNTAX_THEME_OPTIONS={SYNTAX_THEME_OPTIONS}
                        />
                    )}

                    {/* Action Buttons */}
                    <div>
                        <Button
                            isPrimary
                            isBusy={saving}
                            disabled={saving}
                            onClick={saveSettings}
                            style={{ marginRight: '10px' }}
                        >
                            {saving ? __('Saving...', 'dblocks-codepro') : __('Save All Settings', 'dblocks-codepro')}
                        </Button>
                        <Button
                            isDestructive
                            disabled={saving}
                            onClick={() => {
                                if (window.confirm(__('Are you sure you want to reset all settings to their default values? This action cannot be undone.', 'dblocks-codepro'))) {
                                    resetToDefaults();
                                }
                            }}
                        >
                            {__('Reset to Defaults', 'dblocks-codepro')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
