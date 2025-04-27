import { useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { emmetHTML } from 'emmet-monaco-es';
import BlockControlsComponent from './component/BlockControls.js';
import InspectorControlsComponent from './component/InspectorControlsComponent.js';
import { ResizableBox } from "@wordpress/components";
import { useSelect } from '@wordpress/data';
import { updateEditorSize, convertToPx } from './utils/editorUtils.js';

import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
    const { content, viewMode: initialViewMode } = attributes;
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const [fontSize, setFontSize] = useState(attributes.editorFontSize || '14px');
    
    // Ensure editor height is always in px format
    const initialEditorHeight = attributes.editorHeight || '500px';
    const formattedHeight = typeof initialEditorHeight === 'number' ? 
        `${initialEditorHeight}px` : 
        (initialEditorHeight.endsWith('px') ? initialEditorHeight : `${parseInt(initialEditorHeight) || 500}px`);
    
    const [editorHeight, setEditorHeight] = useState(formattedHeight);
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
    const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState(attributes.syntaxHighlightTheme || "light");
    const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || "html");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [shouldReloadEditor, setShouldReloadEditor] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const blockRef = useRef(null);
    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);

    const selectedBlockClientId = useSelect(select =>
        select('core/block-editor').getSelectedBlockClientId()
    );

    const toggleAttribute = (attribute, value) => {
        setAttributes({ [attribute]: value });
    };

    const baseUrl = DBlocksData.restUrl

    const toggleSyntaxHighlightTheme = async (newTheme) => {
        try {
            const response = await fetch(`${baseUrl}syntax-theme/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": wpApiSettings.nonce,
                },
                body: JSON.stringify({ syntaxTheme: newTheme }),
            });

            if (!response.ok) throw new Error("Network response was not ok.");
            setSyntaxHighlightTheme(newTheme);
            toggleAttribute('syntaxHighlightTheme', newTheme);
        } catch (error) {
            console.error("Failed to update syntax theme:", error);
        }
    };

    const changeEditorLanguage = (language) => {
        setEditorLanguage(language);
        setShouldReloadEditor(true);
        toggleAttribute('editorLanguage', language);
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

    const calculateEditorHeight = (content) => {
        const lineCount = (content.match(/\n/g) || []).length + 1;
        const currentFontSize = parseInt(fontSize);
        const lineHeight = currentFontSize * 1.5;
        const padding = currentFontSize * 2;
        const minHeight = currentFontSize * 1.5;
        return `${Math.max(lineCount * lineHeight + padding, minHeight)}px`;
    };

    useEffect(() => {
        if (!syntaxHighlight && showEditor && selectedBlockClientId !== clientId) {
            setShowEditor(false);
        }
    }, [selectedBlockClientId, clientId, showEditor, syntaxHighlight]);

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
                
                // Ensure height is in px format
                const formattedHeight = typeof heightData === 'number' ? 
                    `${heightData}px` : 
                    (heightData.endsWith('px') ? heightData : `${parseInt(heightData) || 500}px`);
                
                setEditorHeight(formattedHeight);

                setAttributes({
                    theme: themeData,
                    editorFontSize: fontSizeData,
                    editorHeight: formattedHeight,
                });
            } catch (error) {
                console.error('Error fetching initial settings:', error);
            }
        };

        fetchInitialSettings();
    }, [setAttributes]);

    useEffect(() => {
        const loadMonacoEditorScript = async (contextWindow, contextDoc) => {
            if (!pluginInfo) {
                console.error("Plugin info not set.");
                return;
            }

            const MONACO_PATH = `${pluginInfo.plugin_url}vendor/monaco/min/vs`;

            if (!Array.from(contextDoc.scripts).some(script => script.src.includes(`${MONACO_PATH}/loader.js`))) {
                const script = contextDoc.createElement('script');
                script.src = `${MONACO_PATH}/loader.js`;
                contextDoc.body.appendChild(script);
            }

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
                    }, 5000);
                });
            };

            try {
                if ((syntaxHighlight || (showEditor && viewMode === 'split'))) {
                    await ensureRequireIsAvailable(contextWindow);
                    contextWindow.require.config({ paths: { 'vs': `${MONACO_PATH}` } });

                    contextWindow.require(['vs/editor/editor.main'], () => {
                        if (editorInstanceRef.current) {
                            editorInstanceRef.current.dispose();
                        }

                        editorInstanceRef.current = contextWindow.monaco.editor.create(editorContainerRef.current, {
                            minimap: { enabled: false },
                            value: content || '<!-- some comment -->',
                            language: editorLanguage,
                            automaticLayout: true,
                            theme: theme,
                            fontSize: parseInt(fontSize),
                            scrollBeyondLastLine: false,
                        });

                        emmetHTML(contextWindow.monaco);

                        editorInstanceRef.current.onDidChangeModelContent(() => {
                            const newValue = editorInstanceRef.current.getValue();
                            toggleAttribute('content', newValue);

                            if (attributes.scaleHeightWithContent || syntaxHighlight) {
                                const newHeight = calculateEditorHeight(newValue);
                                editorContainerRef.current.style.height = newHeight;
                                editorInstanceRef.current.layout();
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Failed to ensure 'require' is available:", error);
            }
        };

        if (syntaxHighlight || ((viewMode === 'split') && pluginInfo)) {
            const iframe = document.querySelector('[name="editor-canvas"]');
            const contextWindow = iframe ? iframe.contentWindow : window;
            const contextDoc = iframe ? iframe.contentWindow.document : document;
            loadMonacoEditorScript(contextWindow, contextDoc);
            setShouldReloadEditor(false);
        }

        return () => {
            if (editorInstanceRef.current && !syntaxHighlight && (viewMode === 'preview' || viewMode === 'split')) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, [viewMode, pluginInfo, shouldReloadEditor, attributes.scaleHeightWithContent, showEditor, syntaxHighlight]);

    useEffect(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== content) {
            editorInstanceRef.current.setValue(content);
        }
    }, [content]);

    useEffect(() => {
        if (editorContainerRef.current && editorInstanceRef.current) {
            if (attributes.scaleHeightWithContent || syntaxHighlight) {
                const newHeight = calculateEditorHeight(content);
                editorContainerRef.current.style.height = newHeight;
            } else {
                // Ensure height has px units
                const heightWithPx = typeof editorHeight === 'number' ? 
                    `${editorHeight}px` :
                    (editorHeight.endsWith('px') ? editorHeight : `${parseInt(editorHeight) || 500}px`);
                
                editorContainerRef.current.style.height = heightWithPx;
            }
            editorInstanceRef.current.layout();
        }
    }, [attributes.scaleHeightWithContent, content, editorHeight, syntaxHighlight]);

    useEffect(() => {
        if (editorInstanceRef.current) {
            editorInstanceRef.current.updateOptions({
                theme: theme,
                fontSize: parseInt(fontSize),
                language: editorLanguage
            });
        }
    }, [theme, fontSize, editorLanguage]);

    useEffect(() => {
        toggleAttribute('viewMode', viewMode);
        if(viewMode === 'split' && !syntaxHighlight){
            setShowEditor(true);
        }
    }, [viewMode, syntaxHighlight]);

    // When syntax highlight state changes
    useEffect(() => {
        // If syntax highlighting is turned on, we should show the editor
        if(syntaxHighlight) {
            setShowEditor(true);
        }
    }, [syntaxHighlight]);

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

    // Handle editor resize by calling the utility function
    const handleEditorResize = (newHeight) => {
        updateEditorSize(
            newHeight, 
            setEditorHeight, 
            toggleAttribute, 
            editorContainerRef, 
            editorInstanceRef
        );
    };

    return (
        <>
            <InspectorControlsComponent
                attributes={attributes}
                setAttributes={setAttributes}
                syntaxHighlight={syntaxHighlight}
                setSyntaxHighlight={setSyntaxHighlight}
                syntaxHighlightTheme={syntaxHighlightTheme}
                toggleSyntaxHighlightTheme={toggleSyntaxHighlightTheme}
                editorLanguage={editorLanguage}
                changeEditorLanguage={changeEditorLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
                editorHeight={editorHeight}
                setEditorHeight={handleEditorResize}
                updateAttribute={updateAttribute}
            />

            <div {...useBlockProps({ ref: blockRef })} style={{ position: 'relative' }}>
                <BlockControlsComponent
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    syntaxHighlight={syntaxHighlight}
                    setSyntaxHighlight={setSyntaxHighlight}
                    setAttributes={setAttributes}
                    editorLanguage={editorLanguage}
                    changeEditorLanguage={changeEditorLanguage}
                />
                
                {/* When syntax highlight is OFF */}
                {!syntaxHighlight && (
                    <>
                        {viewMode === 'preview' && <RawHTML className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                        {viewMode === 'split' && <RawHTML onClick={() => { setShowEditor(true) }} className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                        {showEditor && viewMode === 'split' && !attributes.scaleHeightWithContent && (
                            <ResizableBox
                                className={"code-editor-box"}
                                size={{
                                    height: convertToPx(editorHeight)
                                }}
                                minHeight={10}
                                enable={{ top: true }}
                                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}
                                onResizeStop={(event, direction, ref, d) => {
                                    const currentHeight = convertToPx(editorHeight);
                                    const newHeight = currentHeight + d.height;
                                    handleEditorResize(newHeight);
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
                                    }}
                                />
                            </ResizableBox>
                        )}
                        {showEditor && viewMode === 'split' && attributes.scaleHeightWithContent && (
                            <div
                                ref={editorContainerRef}
                                id='editor-container-ref'
                                style={{
                                    height: calculateEditorHeight(content),
                                    width: '100%',
                                    position: 'fixed',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 9999,
                                    backgroundColor: '#fff',
                                }}
                            />
                        )}
                    </>
                )}
                
                {/* When syntax highlight is ON - always show the editor inline */}
                {syntaxHighlight && (
                    <div
                        ref={editorContainerRef}
                        id='editor-container-ref'
                        style={{
                            height: calculateEditorHeight(content),
                            width: '100%',
                            position: 'relative',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                        }}
                    />
                )}
            </div>
        </>
    );
}
