// Monaco Editor Configuration
(function() {
    'use strict';
    
    // Use the unified settings utility if available, otherwise provide minimal fallback
    // Check both current window and iframe context for settings
    let settingsAvailable = false;
    
    // Check current window
    if (typeof window.DBlocksSettings !== 'undefined') {
        settingsAvailable = true;
        console.log('DBlocks: Settings utility found in current window context');
    }
    
    // Check iframe context (Gutenberg editor)
    const iframe = document.querySelector('[name="editor-canvas"]');
    if (iframe && iframe.contentWindow && iframe.contentWindow.DBlocksSettings) {
        // Copy settings from iframe to current window for Monaco config
        window.DBlocksSettings = iframe.contentWindow.DBlocksSettings;
        settingsAvailable = true;
        console.log('DBlocks: Settings utility found in iframe context, copied to current window');
    }
    
    if (!settingsAvailable) {
        
        // Minimal fallback - just the essential Monaco options
        window.DBlocksSettings = {
            getMonacoOptions: function(overrides = {}) {
                const settings = window.dblocksCodeProSettings || {};
                const baseOptions = {
                    theme: settings.editor_theme || 'vs-dark',
                    lineNumbers: settings.editor_line_numbers || 'on',
                    fontSize: parseInt(settings.editor_font_size || '14'),
                    lineHeight: parseInt(settings.editor_line_height || '20'),
                    letterSpacing: parseInt(settings.editor_letter_spacing || '0'),
                    tabSize: parseInt(settings.editor_tab_size || '4'),
                    wordWrap: settings.editor_word_wrap || 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: (settings.editor_scroll_beyond_last_line || 'off') === 'on',
                    automaticLayout: (settings.editor_automatic_layout || 'on') === 'on',
                    glyphMargin: (settings.editor_glyph_margin || 'on') === 'on',
                    folding: false,

                    bracketPairColorization: true,
                    rulers: settings.editor_rulers ? settings.editor_rulers.split(',').map(r => parseInt(r.trim())) : []
                };
                return { ...baseOptions, ...overrides };
            }
        };
        
        // Try to get settings from iframe when it becomes available
        const checkIframeSettings = () => {
            const iframe = document.querySelector('[name="editor-canvas"]');
            if (iframe && iframe.contentWindow && iframe.contentWindow.DBlocksSettings) {
                console.log('DBlocks: Settings utility found in iframe, updating current window');
                window.DBlocksSettings = iframe.contentWindow.DBlocksSettings;
                return true;
            }
            return false;
        };
        
        // Check periodically for iframe settings
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(checkIframeSettings, 1000); // Wait 1 second for iframe to load
            });
        } else {
            setTimeout(checkIframeSettings, 1000);
        }
    }
    
    // Monaco will be loaded on-demand when the editor is actually needed
    // This matches the working plugin's approach
    
    // Global function to load Monaco when needed
    window.loadMonacoForBlock = async function(pluginPath, contextWindow, contextDoc) {
        const monacoPath = `${pluginPath}vendor/monaco/min/vs`;
                
        try {
            // Load Monaco script if not already loaded in this context
            if (!contextWindow.monaco && !Array.from(contextDoc.scripts).some(script => script.src.includes(`${monacoPath}/loader.js`))) {
                // console.log('Monaco: Loading loader script into context');
                const script = contextDoc.createElement('script');
                script.src = `${monacoPath}/loader.js`;
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    contextDoc.body.appendChild(script);
                });
                // console.log('Monaco: Loader script loaded into context');
            }
            
            // Wait for require to be available in this context
            if (!contextWindow.require) {
                // console.log('Monaco: Waiting for require to be available');
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (contextWindow.require) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 50);
                });
                // console.log('Monaco: Require is now available');
            }
            
            // Configure require paths for this context
            contextWindow.require.config({ paths: { 'vs': monacoPath } });
            
            // Load Monaco editor (same as working plugin)
            return new Promise((resolve, reject) => {
                contextWindow.require(['vs/editor/editor.main'], () => {
                    resolve(contextWindow.monaco);
                }, (error) => {
                    console.error('Monaco: Failed to load editor in context:', error);
                    reject(error);
                });
            });
            
        } catch (error) {
            console.error('Monaco: Error loading Monaco for block:', error);
            throw error;
        }
    };
    
    // Global function to load Emmet support for Monaco
    window.loadEmmetForMonaco = async function(monacoInstance) {
        if (!monacoInstance || monacoInstance._emmetInitialized) {
            return;
        }
        
        try {
            // Try to load Emmet from the emmet-monaco-es package
            // This will work if the package is available in the current context
            if (typeof window.emmetHTML === 'function') {
                window.emmetHTML(monacoInstance);
                monacoInstance._emmetInitialized = true;
                
                // Configure Emmet options for better HTML editing experience
                if (monacoInstance.editor && monacoInstance.editor.getEditors) {
                    const editors = monacoInstance.editor.getEditors();
                    editors.forEach(editor => {
                        // Enable Emmet abbreviations
                        editor.updateOptions({
                            emmet: {
                                showAbbreviationSuggestions: true,
                                showExpandedAbbreviation: 'markup',
                                syntaxProfiles: {
                                    html: {
                                        filters: 'html'
                                    }
                                }
                            }
                        });
                    });
                }
                
                console.log('✅ Emmet support loaded for Monaco editor with enhanced configuration');
                return;
            }
            
            // If emmetHTML is not available globally, try to load it dynamically
            // This is a fallback for contexts where the package might not be bundled
            console.log('ℹ️ Emmet not available globally, trying dynamic load...');
            
        } catch (error) {
            console.warn('⚠️ Failed to load Emmet support:', error);
        }
    };
    
    // console.log('Monaco: Configuration loaded, use window.loadMonacoForBlock() when needed');
})();
