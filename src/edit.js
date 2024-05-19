import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { emmetHTML } from 'emmet-monaco-es';
import BlockControlsComponent from './component/BlockControls.js';

import './editor.scss';

const MONACO_PATH = '/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs';

export default function Edit({ attributes, setAttributes }) {
    const { content, viewMode: initialViewMode } = attributes;
    const [viewMode, setViewMode] = useState(initialViewMode); // Manage the view mode
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);

    const toggleTheme = async () => {
        const newTheme = theme === 'vs-light' ? 'vs-dark' : 'vs-light';
        try {
            const response = await fetch('/wp-json/dblocks-codepro/v1/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce
                },
                body: JSON.stringify({ theme: newTheme })
            });

            if (!response.ok) throw new Error('Network response was not ok.');
            setTheme(newTheme);
            setAttributes({ theme: newTheme });
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    useEffect(() => {
        fetch('/wp-json/dblocks-codepro/v1/theme')
          .then(response => response.json())
          .then(data => {
            setTheme(data);
            setAttributes({ theme: data });
          })
          .catch(error => console.error('Error fetching theme:', error));
    
        fetch('/wp-json/dblocks-codepro/v1/syntax-theme/')
          .then(response => response.json())
          .then(data => {
            setSyntaxHighlightTheme(data);
            setAttributes({ syntaxHighlightTheme: data });
          })
          .catch(error => console.error('Error fetching syntax theme:', error));
    
        fetch('/wp-json/dblocks-codepro/v1/editor-font-size/')
          .then(response => response.json())
          .then(data => {
            // console.log("Fetched font size:", data);  // Check the fetched font size
            setFontSize(data);
            setAttributes({ editorFontSize: data });
          })
          .catch(error => console.error('Error fetching editor font size:', error));
      }, []);

    useEffect(() => {
        const isMonacoLoaderScriptPresent = (contextDoc) => {
            return Array.from(contextDoc.scripts).some(script => script.src.includes(`${MONACO_PATH}/loader.js`));
        };

        const ensureRequireIsAvailable = (contextWindow) => {
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (contextWindow.require && contextWindow.require.config) {
                        clearInterval(checkInterval);
                        resolve(contextWindow.require);
                    }
                }, 50);

                setTimeout(() => {
                    clearInterval(checkInterval);
                    reject(new Error('Require is not available.'));
                }, 5000); // Timeout after 5 seconds
            });
        };

        const initializeMonacoEditor = (contextWindow, monaco) => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
            }

            editorInstanceRef.current = monaco.editor.create(editorContainerRef.current, {
                minimap: { enabled: false },
                value: content || '<!-- some comment -->',
                language: 'html',
                automaticLayout: true,
                theme: theme
            });

            emmetHTML(monaco);

            editorInstanceRef.current.onDidChangeModelContent(() => {
                const newValue = editorInstanceRef.current.getValue();
                setAttributes({ content: newValue });
            });
        };

        const loadMonacoEditorScript = async (contextWindow, contextDoc) => {
            if (!isMonacoLoaderScriptPresent(contextDoc)) {
                const script = contextDoc.createElement('script');
                script.src = `${contextWindow.location.origin}${MONACO_PATH}/loader.js`;
                contextDoc.body.appendChild(script);
            }

            try {
                await ensureRequireIsAvailable(contextWindow);
                contextWindow.require.config({ paths: { 'vs': `${contextWindow.location.origin}${MONACO_PATH}` } });
                contextWindow.require(['vs/editor/editor.main'], () => {
                    initializeMonacoEditor(contextWindow, contextWindow.monaco);
                });
            } catch (error) {
                console.error("Failed to ensure 'require' is available:", error);
            }
        };

        if (viewMode === 'code' || viewMode === 'split') {
            const iframe = document.querySelector('.editor-canvas__iframe');
            if (iframe && iframe.contentWindow) {
                // Load Monaco Editor in the iframe
                loadMonacoEditorScript(iframe.contentWindow, iframe.contentWindow.document);
            } else {
                // Load Monaco Editor in the main document
                loadMonacoEditorScript(window, document);
            }
        }

        // Cleanup editor instance on component unmount or when switching to preview mode
        return () => {
            if (editorInstanceRef.current && (viewMode === 'preview' || viewMode === 'split')) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, [viewMode, theme]); // Re-run this effect whenever viewMode changes

    // Update the editor content if the `content` attribute changes
    useEffect(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== content) {
            editorInstanceRef.current.setValue(content);
        }
    }, [content]);

    // Update the editor theme if the `theme` state changes
    useEffect(() => {
        if (editorInstanceRef.current) {
            editorInstanceRef.current.updateOptions({ theme });
        }
    }, [theme]);

    // Save viewMode to attributes whenever it changes
    useEffect(() => {
        setAttributes({ viewMode });
    }, [viewMode]);

    return (
        <>
            <InspectorControls>
                <Panel>
                    <PanelBody title="Code Editor Settings">

                        <ToggleControl
                            label="Dark Mode"
                            checked={theme === 'vs-dark'}
                            onChange={toggleTheme}
                        />
                        
                    </PanelBody>
                </Panel>
            </InspectorControls>

            <div {...useBlockProps()}>
                <BlockControlsComponent viewMode={viewMode} setViewMode={setViewMode} />
                {viewMode === 'preview' && <RawHTML>{content}</RawHTML>}
                {viewMode === 'split' && <RawHTML>{content}</RawHTML>}
                {(viewMode === 'code' || viewMode === 'split') && (
                    <div ref={editorContainerRef} style={{ height: '50vh' }} />
                )}
            </div>
        </>
    );
}
