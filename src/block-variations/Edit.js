import { useEffect, useRef, useState, useLayoutEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { emmetHTML } from 'emmet-monaco-es';
import BlockControlsComponent from './component/BlockControls.js';
import InspectorControlsComponent from './component/InspectorControlsComponent.js';
import { ResizableBox, Spinner } from "@wordpress/components";
import { useSelect } from '@wordpress/data';
import { parseHeightValue, formatHeightWithPx, convertToPx } from './utils/editor-utils';

import './editor.scss';

// Monaco editor instance cache to prevent reloading when switching blocks
const monacoEditorCache = {
    instances: new Map(), // Map of clientId -> editor instance
    isInitializing: false
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const { content, viewMode: initialViewMode } = attributes;
    const [viewMode, setViewMode] = useState(initialViewMode);

    const [editorHeight, setEditorHeight] = useState(() => {
        // Always use localStorage if available
        const savedHeight = localStorage.getItem('dblocks_editor_height');
        if (savedHeight) {
            return savedHeight;
        }
        // Only fall back to attributes or default if no localStorage value
        return attributes.editorHeight || '500px';
    });
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
    const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState(() => {
        // Try to get from localStorage first
        const savedTheme = localStorage.getItem('dblocks_syntax_theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Fall back to attributes or default
        return attributes.syntaxHighlightTheme || "light";
    });
    
    // Get global editor theme from WordPress data store
    const globalEditorTheme = useSelect(select => {
        // Try to get from WordPress options
        const theme = select('core').getEntityRecord('root', 'site')?.theme_supports?.editor_color_palette;
        return theme ? 'vs-dark' : 'vs-light';
    }, 'vs-light');
    
    // Get global syntax theme setting
    const [globalSyntaxTheme, setGlobalSyntaxTheme] = useState('light');
    
    // Fetch global syntax theme on mount
    useEffect(() => {
        const fetchGlobalTheme = async () => {
            try {
                console.log('Editor: Fetching global theme from:', `${baseUrl}syntax-theme/`);
                const response = await fetch(`${baseUrl}syntax-theme/`);
                if (response.ok) {
                    const theme = await response.text();
                    console.log('Editor: Fetched global theme:', theme);
                    setGlobalSyntaxTheme(theme);
                } else {
                    console.log('Editor: Failed to fetch theme, status:', response.status);
                }
            } catch (error) {
                console.log('Editor: Could not fetch global theme, using default:', error);
            }
        };
        
        fetchGlobalTheme();
    }, []);
    const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || "html");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [editorInitialized, setEditorInitialized] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editorNeedsRefresh, setEditorNeedsRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [displayLanguage, setDisplayLanguage] = useState(() => {
        // Try to get from localStorage first
        const savedDisplayLanguage = localStorage.getItem('dblocks_display_language');
        if (savedDisplayLanguage !== null) {
            return savedDisplayLanguage === 'true';
        }
        // Fall back to attributes or default
        return attributes.displayLanguage ?? true;
    });
    const [copyButton, setCopyButton] = useState(() => {
        // Try to get from localStorage first
        const savedCopyButton = localStorage.getItem('dblocks_copy_button');
        if (savedCopyButton !== null) {
            return savedCopyButton === 'true';
        }
        // Fall back to attributes or default
        return attributes.copyButton ?? true;
    });

    const blockRef = useRef(null);
    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const previousViewModeRef = useRef(initialViewMode);

    const selectedBlockClientId = useSelect(select =>
        select('core/block-editor').getSelectedBlockClientId()
    );

    const calculateEditorHeight = (content) => {
        const lineCount = (content.match(/\n/g) || []).length + 1;
        const defaultFontSize = 14; // Default font size since we removed global settings
        const lineHeight = defaultFontSize * 1.5;
        const padding = defaultFontSize * 2;
        const minHeight = defaultFontSize * 1.5;
        return `${Math.max(lineCount * lineHeight + padding, minHeight)}px`;
    };

    const toggleAttribute = (attribute, value) => {
        setAttributes({ [attribute]: value });
    };

    // Get REST API base URL
    const baseUrl = (typeof DBlocksData !== 'undefined' && DBlocksData.restUrl) 
        ? DBlocksData.restUrl 
        : (typeof wpApiSettings !== 'undefined' && wpApiSettings.root) 
            ? wpApiSettings.root + 'dblocks_codepro/v1/'
            : '/wp-json/dblocks_codepro/v1/';
    
    console.log('Editor: baseUrl:', baseUrl);
    console.log('Editor: DBlocksData available:', typeof DBlocksData !== 'undefined');
    console.log('Editor: wpApiSettings available:', typeof wpApiSettings !== 'undefined');

    const toggleSyntaxHighlightTheme = async (newTheme) => {
        // If no theme is provided, toggle between light and dark
        const newSyntaxTheme = newTheme || (syntaxHighlightTheme === "light" ? "dark" : "light");

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
            
            // Update localStorage first
            localStorage.setItem('dblocks_syntax_theme', newSyntaxTheme);
            // Then update state
            setSyntaxHighlightTheme(newSyntaxTheme);
            // Finally update block attribute
            toggleAttribute('syntaxHighlightTheme', newSyntaxTheme);

            // Dispatch custom event to notify all blocks
            const event = new CustomEvent('dblocks_syntax_theme_changed', {
                detail: { theme: newSyntaxTheme }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error("Failed to update syntax theme:", error);
        }
    };

    // Listen for syntax theme changes from other blocks
    useEffect(() => {
        const handleThemeChange = (event) => {
            const newTheme = event.detail.theme;
            if (newTheme !== syntaxHighlightTheme) {
                setSyntaxHighlightTheme(newTheme);
                setAttributes({ syntaxHighlightTheme: newTheme });
            }
        };

        window.addEventListener('dblocks_syntax_theme_changed', handleThemeChange);
        return () => {
            window.removeEventListener('dblocks_syntax_theme_changed', handleThemeChange);
        };
    }, [syntaxHighlightTheme]);
    
    // Listen for global theme changes and refresh editor
    useEffect(() => {
        if (editorInstanceRef.current && syntaxHighlight) {
            // Update editor theme when global theme changes
            const newTheme = globalSyntaxTheme === 'dark' ? 'vs-dark' : 'vs-light';
            
            // Get the correct context window for Monaco
            const iframe = document.querySelector('[name="editor-canvas"]');
            const contextWindow = iframe ? iframe.contentWindow : window;
            
            if (contextWindow.monaco?.editor) {
                contextWindow.monaco.editor.setTheme(newTheme);
            }
        }
    }, [globalSyntaxTheme, syntaxHighlight]);

    // Check for theme changes on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('dblocks_syntax_theme');
        if (savedTheme && savedTheme !== syntaxHighlightTheme) {
            setSyntaxHighlightTheme(savedTheme);
            setAttributes({ syntaxHighlightTheme: savedTheme });
        }
    }, []);

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

            // If this is the display language attribute, update localStorage and dispatch event
            if (attribute === 'displayLanguage') {
                localStorage.setItem('dblocks_display_language', value);
                const event = new CustomEvent('dblocks_display_language_changed', {
                    detail: { displayLanguage: value }
                });
                window.dispatchEvent(event);
            }
            // If this is the copy button attribute, update localStorage and dispatch event
            else if (attribute === 'copyButton') {
                localStorage.setItem('dblocks_copy_button', value);
                const event = new CustomEvent('dblocks_copy_button_changed', {
                    detail: { copyButton: value }
                });
                window.dispatchEvent(event);
            }
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

    // Syntax highlighting is now determined by block variation, not a toggle
    // This function can be removed since we no longer toggle syntax highlighting

    // Initialize or reuse editor when needed
    useEffect(() => {
        if (syntaxHighlight || (selectedBlockClientId === clientId && viewMode === 'split')) {
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
            // Clean up editor instance when:
            // 1. Block is deselected and syntax highlighting is off
            // 2. View mode is not split and syntax highlighting is off
            if (!syntaxHighlight && 
                ((selectedBlockClientId !== clientId) || viewMode !== 'split') && 
                editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
                monacoEditorCache.instances.delete(clientId);
            }
        };
    }, [syntaxHighlight, selectedBlockClientId, clientId, viewMode, pluginInfo]);

    // Monitor block selection changes
    useEffect(() => {
        // Skip the initial mount to prevent automatic selection
        if (!selectedBlockClientId) {
            return;
        }

        if (selectedBlockClientId !== clientId) {
            setShowEditor(false);
            // Clean up editor instance if syntax highlighting is off
            if (!syntaxHighlight && editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
                monacoEditorCache.instances.delete(clientId);
            }
        } else if (viewMode === 'split') {
            // Show editor when this block is selected and in split mode
            setShowEditor(true);
            
            // Check and update height from localStorage when block is selected
            const savedHeight = localStorage.getItem('dblocks_editor_height');
            if (savedHeight && savedHeight !== editorHeight) {
                setEditorHeight(savedHeight);
                setAttributes({ editorHeight: savedHeight });
                if (editorContainerRef.current) {
                    editorContainerRef.current.style.height = savedHeight;
                    editorInstanceRef.current?.layout();
                }
            }

            // Check and update syntax theme from localStorage when block is selected
            const savedTheme = localStorage.getItem('dblocks_syntax_theme');
            if (savedTheme && savedTheme !== syntaxHighlightTheme) {
                setSyntaxHighlightTheme(savedTheme);
                setAttributes({ syntaxHighlightTheme: savedTheme });
            }
        }
    }, [selectedBlockClientId, clientId, viewMode, syntaxHighlight]);

    // Update editor container visibility
    const shouldShowEditor = syntaxHighlight || (selectedBlockClientId === clientId && viewMode === 'split');

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
            if (syntaxHighlight) {
                // For syntax highlighter, use calculated height based on content
                const newHeight = calculateEditorHeight(content);
                editorContainerRef.current.style.height = newHeight;
            } else {
                // For code executor, always use the fixed editorHeight from localStorage
                editorContainerRef.current.style.height = editorHeight;
            }
            editorInstanceRef.current.layout();
        }
    }, [syntaxHighlight, content, editorHeight]);



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
        // Save to localStorage first
        localStorage.setItem('dblocks_editor_height', heightWithPx);
        // Then update block attribute
        toggleAttribute('editorHeight', heightWithPx);

        if (editorContainerRef.current) {
            editorContainerRef.current.style.height = heightWithPx;
            editorInstanceRef.current?.layout();
        }
    };

    const initMonacoEditor = async (contextWindow, contextDoc) => {
        if (!pluginInfo || monacoEditorCache.isInitializing) {
            return;
        }

        setIsLoading(true);

        // Only force refresh when syntax highlight is toggled or view mode changes from preview to split
        const needsRefresh = editorNeedsRefresh || 
                            (previousViewModeRef.current === 'preview' && viewMode === 'split');

        // Reuse existing editor instance if available and no refresh is needed
        if (monacoEditorCache.instances.has(clientId) && !needsRefresh) {
            editorInstanceRef.current = monacoEditorCache.instances.get(clientId);
            if (!editorInitialized) {
                setEditorInitialized(true);
            }
            
            // Only update layout, don't focus
            setTimeout(() => {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.layout();
                }
            }, 50);
            
            setIsLoading(false);
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
                    // Always dispose of existing instance before creating a new one
                    if (editorInstanceRef.current) {
                        editorInstanceRef.current.dispose();
                        editorInstanceRef.current = null;
                        monacoEditorCache.instances.delete(clientId);
                    }

                    // Ensure the container is visible and has dimensions
                    if (editorContainerRef.current) {
                        editorContainerRef.current.style.display = 'block';
                        editorContainerRef.current.style.visibility = 'visible';
                    }

                    // Create a new editor instance
                    const editorTheme = globalSyntaxTheme === 'dark' ? 'vs-dark' : 'vs-light';
                    console.log('Editor: Creating Monaco editor with theme:', editorTheme, '(globalSyntaxTheme:', globalSyntaxTheme, ')');
                    
                    editorInstanceRef.current = contextWindow.monaco.editor.create(editorContainerRef.current, {
                        minimap: { enabled: false },
                        value: content || '<!-- some comment -->',
                        language: editorLanguage,
                        theme: editorTheme,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        wordBasedSuggestions: true,
                        parameterHints: {
                            enabled: true
                        }
                    });

                    // Add Emmet support only if not already added
                    if (!contextWindow.monaco._emmetInitialized) {
                        emmetHTML(contextWindow.monaco);
                        contextWindow.monaco._emmetInitialized = true;
                    }

                    // Add change handler
                    editorInstanceRef.current.onDidChangeModelContent(() => {
                        const newValue = editorInstanceRef.current.getValue();
                        toggleAttribute('content', newValue);

                        // For syntax highlighter, update height based on content changes
                        if (syntaxHighlight) {
                            const newHeight = calculateEditorHeight(newValue);
                            editorContainerRef.current.style.height = newHeight;
                            editorInstanceRef.current.layout();
                        }
                    });

                    // Only update layout, don't focus
                    setTimeout(() => {
                        if (editorInstanceRef.current) {
                            editorInstanceRef.current.layout();
                        }
                    }, 10);

                    // Cache the editor instance
                    monacoEditorCache.instances.set(clientId, editorInstanceRef.current);
                    setEditorInitialized(true);
                    resolve();
                });
            });
        } catch (error) {
            console.error("Failed to initialize Monaco editor:", error);
        } finally {
            monacoEditorCache.isInitializing = false;
            setIsLoading(false);
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

    // Sync syntaxHighlight state with attributes when variation changes
    useEffect(() => {
        if (attributes.syntaxHighlight !== syntaxHighlight) {
            setSyntaxHighlight(attributes.syntaxHighlight);
        }
    }, [attributes.syntaxHighlight]);

    // Handle variation-specific attribute changes
    useEffect(() => {
        // When syntax highlighting is ON (Syntax Highlighter variation)
        if (syntaxHighlight) {
            // Default to preview mode for syntax highlighter
            if (viewMode === 'split') {
                setViewMode('preview');
                toggleAttribute('viewMode', 'preview');
            }
        } else {
            // When syntax highlighting is OFF (Code Executor variation)
            // Force split mode for code executor
            if (viewMode === 'preview') {
                setViewMode('split');
                toggleAttribute('viewMode', 'split');
            }
        }
    }, [syntaxHighlight]);

    // Listen for display language changes from other blocks
    useEffect(() => {
        const handleDisplayLanguageChange = (event) => {
            const newValue = event.detail.displayLanguage;
            if (newValue !== displayLanguage) {
                setDisplayLanguage(newValue);
                setAttributes({ displayLanguage: newValue });
            }
        };

        window.addEventListener('dblocks_display_language_changed', handleDisplayLanguageChange);
        return () => {
            window.removeEventListener('dblocks_display_language_changed', handleDisplayLanguageChange);
        };
    }, [displayLanguage]);

    // Check for display language changes on mount
    useEffect(() => {
        const savedDisplayLanguage = localStorage.getItem('dblocks_display_language');
        if (savedDisplayLanguage !== null) {
            const newValue = savedDisplayLanguage === 'true';
            if (newValue !== displayLanguage) {
                setDisplayLanguage(newValue);
                setAttributes({ displayLanguage: newValue });
            }
        }
    }, []);

    // Listen for copy button changes from other blocks
    useEffect(() => {
        const handleCopyButtonChange = (event) => {
            const newValue = event.detail.copyButton;
            if (newValue !== copyButton) {
                setCopyButton(newValue);
                setAttributes({ copyButton: newValue });
            }
        };

        window.addEventListener('dblocks_copy_button_changed', handleCopyButtonChange);
        return () => {
            window.removeEventListener('dblocks_copy_button_changed', handleCopyButtonChange);
        };
    }, [copyButton]);

    // Check for copy button changes on mount
    useEffect(() => {
        const savedCopyButton = localStorage.getItem('dblocks_copy_button');
        if (savedCopyButton !== null) {
            const newValue = savedCopyButton === 'true';
            if (newValue !== copyButton) {
                setCopyButton(newValue);
                setAttributes({ copyButton: newValue });
            }
        }
    }, []);

    return (
        <>
            <InspectorControlsComponent
                attributes={attributes}
                setAttributes={setAttributes}
                syntaxHighlight={syntaxHighlight}
                syntaxHighlightTheme={syntaxHighlightTheme}
                toggleSyntaxHighlightTheme={toggleSyntaxHighlightTheme}
                editorLanguage={editorLanguage}
                changeEditorLanguage={changeEditorLanguage}
                editorHeight={editorHeight}
                setEditorHeight={updateEditorSize}
                updateAttribute={updateAttribute}
                displayLanguage={displayLanguage}
                copyButton={copyButton}
            />

            <div {...useBlockProps({ ref: blockRef })} style={{ position: 'relative', height: '100vh' }}>
                <BlockControlsComponent
                    viewMode={viewMode}
                    setViewMode={handleViewModeChange}
                    syntaxHighlight={syntaxHighlight}
                    setAttributes={setAttributes}
                    editorLanguage={editorLanguage}
                    changeEditorLanguage={changeEditorLanguage}
                />
                {!syntaxHighlight && viewMode === 'preview' && <RawHTML className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {!syntaxHighlight && viewMode === 'split' && <RawHTML onClick={() => { setShowEditor(true) }} className={`syntax-${syntaxHighlightTheme}`}>{content}</RawHTML>}
                {shouldShowEditor && (!syntaxHighlight && viewMode === 'split') ? (
                    <ResizableBox
                        className={"code-editor-box"}
                        size={{
                            height: convertToPx(editorHeight)
                        }}
                        minHeight={10}
                        enable={{ top: true }}
                        style={{ 
                            position: syntaxHighlight ? 'relative' : 'fixed',
                            bottom: syntaxHighlight ? 'auto' : 0,
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            isolation: 'isolate'
                        }}
                        onResizeStop={(event, direction, ref, d) => {
                            const currentHeight = convertToPx(editorHeight);
                            const newHeight = currentHeight + d.height;
                            const heightWithPx = formatHeightWithPx(newHeight);
                            
                            // Update localStorage first
                            localStorage.setItem('dblocks_editor_height', heightWithPx);
                            // Then update state
                            setEditorHeight(heightWithPx);
                            // Finally update block attribute
                            setAttributes({ editorHeight: heightWithPx });
                            
                            // Update editor size
                            if (editorContainerRef.current) {
                                editorContainerRef.current.style.height = heightWithPx;
                                editorInstanceRef.current?.layout();
                            }
                        }}
                    >
                        <div
                            ref={editorContainerRef}
                            id='editor-container-ref'
                            style={{
                                height: '100%',
                                width: '100%',
                                position: syntaxHighlight ? 'relative' : 'absolute',
                                bottom: syntaxHighlight ? 'auto' : 0,
                                left: 0,
                                right: 0,
                                zIndex: 9999,
                                backgroundColor: '#fff',
                                visibility: shouldShowEditor ? 'visible' : 'hidden',
                                display: shouldShowEditor ? 'block' : 'none',
                                isolation: 'isolate'
                            }}
                        />
                        {isLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 10000
                            }}>
                                <Spinner />
                            </div>
                        )}
                    </ResizableBox>
                ) : (
                    <div style={{ position: 'relative', isolation: 'isolate', zIndex: 100 }}>
                        <div
                            ref={editorContainerRef}
                            id='editor-container-ref'
                            style={{
                                height: calculateEditorHeight(content),
                                width: '100%',
                                position: syntaxHighlight ? 'relative' : 'fixed',
                                bottom: syntaxHighlight ? 'auto' : 0,
                                left: 0,
                                right: 0,
                                zIndex: 9999,
                                backgroundColor: '#fff',
                                visibility: shouldShowEditor ? 'visible' : 'hidden',
                                display: shouldShowEditor ? 'block' : 'none',
                                isolation: 'isolate'
                            }}
                        />
                        {isLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 10000
                            }}>
                                <Spinner />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
