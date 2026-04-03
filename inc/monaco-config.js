// Monaco Editor Configuration
// WP 7+ always uses iframe — Monaco loads into the iframe context on demand.
(function() {
    'use strict';

    // Global function to load Monaco when needed
    window.loadMonacoForBlock = async function(pluginPath, contextWindow, contextDoc) {
        const monacoPath = `${pluginPath}vendor/monaco/min/vs`;

        try {
            // Load Monaco script if not already loaded in this context
            if (!contextWindow.monaco && !Array.from(contextDoc.scripts).some(script => script.src.includes(`${monacoPath}/loader.js`))) {
                const script = contextDoc.createElement('script');
                script.src = `${monacoPath}/loader.js`;

                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    contextDoc.body.appendChild(script);
                });
            }

            // Wait for require to be available in this context
            if (!contextWindow.require) {
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (contextWindow.require) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 50);
                });
            }

            // Configure require paths for this context
            contextWindow.require.config({ paths: { 'vs': monacoPath } });

            // Load Monaco editor
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
            if (typeof window.emmetHTML === 'function') {
                window.emmetHTML(monacoInstance);
                monacoInstance._emmetInitialized = true;

                if (monacoInstance.editor && monacoInstance.editor.getEditors) {
                    const editors = monacoInstance.editor.getEditors();
                    editors.forEach(editor => {
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

                console.log('Emmet support loaded for Monaco editor');
                return;
            }

            console.log('Emmet not available globally, trying dynamic load...');

        } catch (error) {
            console.warn('Failed to load Emmet support:', error);
        }
    };
})();
