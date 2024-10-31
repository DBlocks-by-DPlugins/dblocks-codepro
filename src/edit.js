import { useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { emmetHTML } from 'emmet-monaco-es';
import BlockControlsComponent from './component/BlockControls.js';
import InspectorControlsComponent from './component/InspectorControlsComponent.js';
import { useSelect } from '@wordpress/data';

import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { content, viewMode: initialViewMode } = attributes;
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const [fontSize, setFontSize] = useState(attributes.editorFontSize || '14px');
    const [editorHeight, setEditorHeight] = useState(attributes.editorHeight || '50vh');
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
    const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState(attributes.syntaxHighlightTheme || "light");
    const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || "html");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [shouldReloadEditor, setShouldReloadEditor] = useState(false);

    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);

    const toggleAttribute = (attribute, value) => {
        setAttributes({ [attribute]: value });
    };

    const baseUrl = useSelect(select => {
        const site = select('core').getSite();
        return site ? site.url : '';
    }, []);

    const toggleSyntaxHighlightTheme = async () => {
        const newSyntaxTheme = syntaxHighlightTheme === "light" ? "dark" : "light";

        try {
            const response = await fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/syntax-theme/`, {
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
        setShouldReloadEditor(true);
        toggleAttribute('editorLanguage', language);
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'vs-light' ? 'vs-dark' : 'vs-light';
        try {
            const response = await fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/theme`, {
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

    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                const [themeResponse, fontSizeResponse, heightResponse] = await Promise.all([
                    fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/theme`),
                    fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/editor-font-size/`),
                    fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/editor-height/`),
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
                    });

                    emmetHTML(contextWindow.monaco);

                    editorInstanceRef.current.onDidChangeModelContent(() => {
                        const newValue = editorInstanceRef.current.getValue();
                        toggleAttribute('content', newValue);
                    });
                });
            } catch (error) {
                console.error("Failed to ensure 'require' is available:", error);
            }
        };

        if ((viewMode === 'code' || viewMode === 'split') && pluginInfo) {
            const iframe = document.querySelector('[name="editor-canvas"]');
            const contextWindow = iframe ? iframe.contentWindow : window;
            const contextDoc = iframe ? iframe.contentWindow.document : document;
            loadMonacoEditorScript(contextWindow, contextDoc);
            setShouldReloadEditor(false);
        }

        return () => {
            if (editorInstanceRef.current && (viewMode === 'preview' || viewMode === 'split')) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, [viewMode, pluginInfo, shouldReloadEditor]);

    useEffect(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== content) {
            editorInstanceRef.current.setValue(content);
        }
    }, [content]);

    useEffect(() => {
        if (editorContainerRef.current) {
            editorContainerRef.current.style.height = editorHeight;
            if (editorInstanceRef.current) {
                editorInstanceRef.current.layout();
            }
        }
    }, [editorHeight]);

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
    }, [viewMode]);

    useEffect(() => {
        const fetchPluginInfo = async () => {
            try {
                const response = await fetch(`${baseUrl}/wp-json/dblocks_codepro/v1/plugin-path`);
                if (!response.ok) throw new Error("Failed to fetch plugin info");
                const info = await response.json();
                setPluginInfo(info);
            } catch (error) {
                console.error("Failed to fetch plugin info:", error);
            }
        };

        fetchPluginInfo();
    }, []);

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
                setEditorHeight={setEditorHeight}
                updateAttribute={updateAttribute}
            />

            <div {...useBlockProps()}>
                <BlockControlsComponent viewMode={viewMode} setViewMode={setViewMode} />
                {viewMode === 'preview' && <RawHTML className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {viewMode === 'split' && <RawHTML className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {(viewMode === 'code' || viewMode === 'split') && (
                    <div ref={editorContainerRef} id='editor-container-ref' style={{ height: editorHeight }} />
                )}
            </div>
        </>
    );
}
