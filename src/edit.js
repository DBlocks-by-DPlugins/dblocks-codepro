import { useEffect, useRef, useState, useLayoutEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { emmetHTML } from 'emmet-monaco-es';
import BlockControlsComponent from './component/BlockControls.js';
import InspectorControlsComponent from './component/InspectorControlsComponent.js';
import { ResizableBox } from "@wordpress/components";
import { useSelect } from '@wordpress/data';
import { parseHeightValue, formatHeightWithPx, convertToPx } from './utils/editor-utils';

import './editor.scss';

// Monaco editor instance cache to prevent reloading when switching blocks
const monacoEditorCache = {
    instance: null,
    isInitializing: false,
    lastClientId: null
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const { content, viewMode: initialViewMode } = attributes;
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const [fontSize, setFontSize] = useState(attributes.editorFontSize || '14px');
    const [editorHeight, setEditorHeight] = useState(attributes.editorHeight || '500px');
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
    const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState(attributes.syntaxHighlightTheme || "light");
    const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || "html");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [editorInitialized, setEditorInitialized] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editorNeedsRefresh, setEditorNeedsRefresh] = useState(false);

    const blockRef = useRef(null);
    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const previousViewModeRef = useRef(initialViewMode);

    const selectedBlockClientId = useSelect(select =>
        select('core/block-editor').getSelectedBlockClientId()
    );

    const calculateEditorHeight = (content) => {
        const lineCount = (content.match(/\n/g) || []).length + 1;
        const currentFontSize = parseInt(fontSize);
        const lineHeight = currentFontSize * 1.5;
        const padding = currentFontSize * 2;
        const minHeight = currentFontSize * 1.5;
        return `${Math.max(lineCount * lineHeight + padding, minHeight)}px`;
    };

    const toggleAttribute = (attribute, value) => {
        setAttributes({ [attribute]: value });
    };

    const baseUrl = DBlocksData.restUrl

    const toggleSyntaxHighlightTheme = async () => {
        const newSyntaxTheme = syntaxHighlightTheme === "light" ? "dark" : "light";

        try {
            const response = await fetch(`${baseUrl}syntax-theme/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": wpApiSettings.nonce,
                },
                body: JSON.stringify({ syntaxTheme: newSyntaxTheme }),
            });

            if (!response.ok) throw new Error("Network response was not ok.");
            setSyntaxHighlightTheme(newSyntaxTheme);
            toggleAttribute('syntaxHighlightTheme', newSyntaxTheme);
        } catch (error) {
            console.error("Failed to update syntax theme:", error);
        }
    };

    const changeEditorLanguage = (language) => {
        setEditorLanguage(language);
        toggleAttribute('editorLanguage', language);
        
        // Update language in existing editor instance
        if (editorInstanceRef.current) {
            const model = editorInstanceRef.current.getModel();
            if (model) {
                const monaco = window.monaco || (document.querySelector('[name="editor-canvas"]')?.contentWindow?.monaco);
                if (monaco) {
                    monaco.editor.setModelLanguage(model, language);
                }
            }
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'vs-light' ? 'vs-dark' : 'vs-light';
        try {
            const response = await fetch(`${baseUrl}theme`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce,
                },
                body: JSON.stringify({ theme: newTheme }),
            });

            if (!response.ok) throw new Error('Network response was not ok.');
            setTheme(newTheme);
            toggleAttribute('theme', newTheme);
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    const updateAttribute = async (attribute, value, endpoint) => {
        setAttributes({ [attribute]: value });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce,
                },
                body: JSON.stringify({ [attribute]: value }),
            });

            if (!response.ok) throw new Error('Network response was not ok.');
        } catch (error) {
            console.error(`Failed to update ${attribute}:`, error);
        }
    };

    // Handle view mode change
    const handleViewModeChange = (newViewMode) => {
        previousViewModeRef.current = viewMode;
        setViewMode(newViewMode);
        
        if (newViewMode === 'split') {
            setShowEditor(true);
            setEditorNeedsRefresh(true);
        }
    };

    // Handle syntax highlight toggle
    const handleSyntaxHighlightToggle = (newState) => {
        setSyntaxHighlight(newState);
        setAttributes({ 
            syntaxHighlight: newState,
            // When highlighting is ON: enable scale height with content
            // When highlighting is OFF: disable scale height with content
            scaleHeightWithContent: newState
        });
        setEditorNeedsRefresh(true);
        
        // Force editor to refresh when syntax highlighting is toggled
        if (showEditor && viewMode === 'split') {
            // Add a small delay to ensure UI updates first
            setTimeout(() => {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.layout();
                    const iframe = document.querySelector('[name="editor-canvas"]');
                    const contextWindow = iframe ? iframe.contentWindow : window;
                    if (contextWindow && contextWindow.monaco) {
                        editorInstanceRef.current.focus();
                    }
                }
            }, 50);
        }
    };

    // Monitor block selection changes
    useEffect(() => {
        if (selectedBlockClientId !== clientId) {
            // Hide editor when switching to another block
            setShowEditor(false);
        } else if (viewMode === 'split') {
            // Show editor when this block is selected and in split mode
            setShowEditor(true);
        }
    }, [selectedBlockClientId, clientId, viewMode]);

    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                const [themeResponse, fontSizeResponse, heightResponse] = await Promise.all([
                    fetch(`${baseUrl}theme`),
                    fetch(`${baseUrl}editor-font-size/`),
                    fetch(`${baseUrl}editor-height/`),
                ]);

                const [themeData, fontSizeData, heightData] = await Promise.all([
                    themeResponse.json(),
                    fontSizeResponse.json(),
                    heightResponse.json(),
                ]);

                setTheme(themeData);
                setFontSize(fontSizeData);
                setEditorHeight(heightData);

                setAttributes({
                    theme: themeData,
                    editorFontSize: fontSizeData,
                    editorHeight: heightData,
                });
            } catch (error) {
                console.error('Error fetching initial settings:', error);
            }
        };

        fetchInitialSettings();
    }, [setAttributes]);

    const initMonacoEditor = async (contextWindow, contextDoc) => {
        if (!pluginInfo || monacoEditorCache.isInitializing) {
            return;
        }

        // Force fresh editor when syntax highlight is toggled or view mode changes from preview to split
        const needsRefresh = editorNeedsRefresh || 
                            (previousViewModeRef.current === 'preview' && viewMode === 'split');

        if (needsRefresh && monacoEditorCache.instance) {
            monacoEditorCache.instance.dispose();
            monacoEditorCache.instance = null;
            monacoEditorCache.lastClientId = null;
            setEditorNeedsRefresh(false);
        }

        if (monacoEditorCache.instance && monacoEditorCache.lastClientId === clientId && !needsRefresh) {
            // Reuse existing editor instance for the same block
            editorInstanceRef.current = monacoEditorCache.instance;
            if (!editorInitialized) {
                setEditorInitialized(true);
            }
            
            // Ensure the editor gets focus and updates its layout
            setTimeout(() => {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.layout();
                    editorInstanceRef.current.focus();
                }
            }, 50);
            
            return;
        }

        monacoEditorCache.isInitializing = true;
        const MONACO_PATH = `${pluginInfo.plugin_url}vendor/monaco/min/vs`;

        try {
            // Load Monaco script if not already loaded
            if (!contextWindow.monaco && !Array.from(contextDoc.scripts).some(script => script.src.includes(`${MONACO_PATH}/loader.js`))) {
                const script = contextDoc.createElement('script');
                script.src = `${MONACO_PATH}/loader.js`;
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    contextDoc.body.appendChild(script);
                });
            }

            // Wait for require to be available
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

            contextWindow.require.config({ paths: { 'vs': MONACO_PATH } });

            // Create editor instance
            await new Promise((resolve) => {
                contextWindow.require(['vs/editor/editor.main'], () => {
                    // Dispose previous editor if it exists
                    if (editorInstanceRef.current) {
                        editorInstanceRef.current.dispose();
                    }

                    // Ensure the container is visible and has dimensions
                    if (editorContainerRef.current) {
                        editorContainerRef.current.style.display = 'block';
                        editorContainerRef.current.style.visibility = 'visible';
                    }

                    // Create a new editor instance
                    editorInstanceRef.current = contextWindow.monaco.editor.create(editorContainerRef.current, {
                        minimap: { enabled: false },
                        value: content || '<!-- some comment -->',
                        language: editorLanguage,
                        automaticLayout: true,
                        theme: theme,
                        fontSize: parseInt(fontSize),
                        scrollBeyondLastLine: false,
                    });

                    // Add Emmet support
                    emmetHTML(contextWindow.monaco);

                    // Add change handler
                    editorInstanceRef.current.onDidChangeModelContent(() => {
                        const newValue = editorInstanceRef.current.getValue();
                        toggleAttribute('content', newValue);

                        if (attributes.scaleHeightWithContent) {
                            const newHeight = calculateEditorHeight(newValue);
                            editorContainerRef.current.style.height = newHeight;
                            editorInstanceRef.current.layout();
                        }
                    });

                    // Make sure editor is visible and gets focus
                    setTimeout(() => {
                        if (editorInstanceRef.current) {
                            editorInstanceRef.current.layout();
                            editorInstanceRef.current.focus();
                        }
                    }, 10);

                    // Cache the editor instance
                    monacoEditorCache.instance = editorInstanceRef.current;
                    monacoEditorCache.lastClientId = clientId;
                    setEditorInitialized(true);
                    resolve();
                });
            });
        } catch (error) {
            console.error("Failed to initialize Monaco editor:", error);
        } finally {
            monacoEditorCache.isInitializing = false;
        }
    };

    // Handle syntax highlight changes
    useEffect(() => {
        if (showEditor && viewMode === 'split') {
            setEditorNeedsRefresh(true);
        }
    }, [syntaxHighlight]);

    // Handle view mode changes
    useEffect(() => {
        // Track when changing from preview to split
        if (previousViewModeRef.current === 'preview' && viewMode === 'split') {
            setEditorNeedsRefresh(true);
        }
        
        // Update attribute
        toggleAttribute('viewMode', viewMode);
        
        // Show editor in split mode
        if (viewMode === 'split') {
            setShowEditor(true);
        }
        
        // Update previous view mode after effect is applied
        previousViewModeRef.current = viewMode;
    }, [viewMode]);

    // Initialize or reuse editor when needed
    useEffect(() => {
        if (showEditor && viewMode === 'split' && pluginInfo) {
            const iframe = document.querySelector('[name="editor-canvas"]');
            const contextWindow = iframe ? iframe.contentWindow : window;
            const contextDoc = iframe ? iframe.contentWindow.document : document;
            
            // Small delay to ensure DOM is ready
            const initTimer = setTimeout(() => {
                initMonacoEditor(contextWindow, contextDoc);
            }, 10);
            
            return () => clearTimeout(initTimer);
        }

        return () => {
            // Don't dispose the editor when hiding - we'll reuse it
            // Only clean up when component unmounts
            if (!showEditor && editorInstanceRef.current && monacoEditorCache.lastClientId !== clientId) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, [viewMode, pluginInfo, showEditor, clientId, editorNeedsRefresh]);

    // Force re-render when editor container is first created or refreshed
    useLayoutEffect(() => {
        if (editorContainerRef.current && editorNeedsRefresh) {
            // Force a redraw of the container
            const display = editorContainerRef.current.style.display;
            editorContainerRef.current.style.display = 'none';
            
            // This forces a reflow
            void editorContainerRef.current.offsetHeight;
            
            // Restore original display
            editorContainerRef.current.style.display = display || 'block';
        }
    }, [editorContainerRef.current, editorNeedsRefresh]);

    // Update editor content when content changes from outside
    useEffect(() => {
        if (editorInstanceRef.current && editorInitialized) {
            const currentValue = editorInstanceRef.current.getValue();
            if (currentValue !== content) {
                editorInstanceRef.current.setValue(content);
            }
        }
    }, [content, editorInitialized]);

    // Update editor height when appropriate
    useEffect(() => {
        if (editorContainerRef.current && editorInstanceRef.current) {
            if (attributes.scaleHeightWithContent) {
                const newHeight = calculateEditorHeight(content);
                editorContainerRef.current.style.height = newHeight;
            } else {
                editorContainerRef.current.style.height = editorHeight;
            }
            editorInstanceRef.current.layout();
        }
    }, [attributes.scaleHeightWithContent, content, editorHeight]);

    // Update editor options when theme, font size, or language changes
    useEffect(() => {
        if (editorInstanceRef.current) {
            editorInstanceRef.current.updateOptions({
                theme: theme,
                fontSize: parseInt(fontSize),
            });
        }
    }, [theme, fontSize]);

    // Fetch plugin info on component mount
    useEffect(() => {
        const fetchPluginInfo = async () => {
            try {
                const response = await fetch(`${baseUrl}plugin-path`);
                if (!response.ok) throw new Error("Failed to fetch plugin info");
                const info = await response.json();
                setPluginInfo(info);
            } catch (error) {
                console.error("Failed to fetch plugin info:", error);
            }
        };

        fetchPluginInfo();
    }, []);

    // Function to handle editor resize - using utilities from editor-utils.js
    const updateEditorSize = (newHeight) => {
        const heightWithPx = formatHeightWithPx(newHeight);
        setEditorHeight(heightWithPx);
        toggleAttribute('editorHeight', heightWithPx);

        if (editorContainerRef.current) {
            editorContainerRef.current.style.height = heightWithPx;
            editorInstanceRef.current?.layout();
        }
    };

    return (
        <>
            <InspectorControlsComponent
                attributes={attributes}
                setAttributes={setAttributes}
                syntaxHighlight={syntaxHighlight}
                setSyntaxHighlight={handleSyntaxHighlightToggle}
                syntaxHighlightTheme={syntaxHighlightTheme}
                toggleSyntaxHighlightTheme={toggleSyntaxHighlightTheme}
                editorLanguage={editorLanguage}
                changeEditorLanguage={changeEditorLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
                editorHeight={editorHeight}
                setEditorHeight={updateEditorSize}
                updateAttribute={updateAttribute}
            />

            <div {...useBlockProps({ ref: blockRef })} style={{ position: 'relative', height: '100vh' }}>
                <BlockControlsComponent
                    viewMode={viewMode}
                    setViewMode={handleViewModeChange}
                    syntaxHighlight={syntaxHighlight}
                    setSyntaxHighlight={handleSyntaxHighlightToggle}
                    setAttributes={setAttributes}
                    editorLanguage={editorLanguage}
                    changeEditorLanguage={changeEditorLanguage}
                />
                {viewMode === 'preview' && <RawHTML className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {viewMode === 'split' && <RawHTML onClick={() => { setShowEditor(true) }} className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {showEditor && viewMode === 'split' && (
                    syntaxHighlight ? (
                        // When syntax highlighting is ON: regular div inside the block
                        <div
                            ref={editorContainerRef}
                            id='editor-container-ref'
                            style={{
                                height: calculateEditorHeight(content),
                                width: '100%',
                                position: 'relative',
                                zIndex: 9999,
                                backgroundColor: '#fff',
                                visibility: 'visible',
                                display: 'block'
                            }}
                        />
                    ) : (
                        // When syntax highlighting is OFF: resizable box at the bottom
                        <ResizableBox
                            className={"code-editor-box"}
                            size={{
                                height: convertToPx(editorHeight)
                            }}
                            minHeight={10}
                            enable={{ top: true }}
                            style={{ 
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 9999
                            }}
                            onResizeStop={(event, direction, ref, d) => {
                                const currentHeight = convertToPx(editorHeight);
                                const newHeight = currentHeight + d.height;
                                updateEditorSize(newHeight);
                                updateAttribute('editorHeight', newHeight, '/wp-json/dblocks_codepro/v1/editor-height/');
                            }}
                        >
                            <div
                                ref={editorContainerRef}
                                id='editor-container-ref'
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 9999,
                                    backgroundColor: '#fff',
                                    visibility: 'visible',
                                    display: 'block'
                                }}
                            />
                        </ResizableBox>
                    )
                )}
            </div>
        </>
    );
}
