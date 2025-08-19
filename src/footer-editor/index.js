/**
 * DBlocks Code Pro Footer Monaco Editor
 * React component for HTML editing in admin footer
 */

import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

import './style.css';

/**
 * Monaco Editor Component
 */
const MonacoEditor = () => {
    const [monacoInstance, setMonacoInstance] = useState(null);
    const [monacoEditor, setMonacoEditor] = useState(null);
    const [currentBlockId, setCurrentBlockId] = useState(null);
    const currentBlockIdRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisposing, setIsDisposing] = useState(false);
    const containerRef = useRef(null);
    const resizeHandlerRef = useRef(null);
    const suppressContentChangeRef = useRef(false);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // Get current block selection from Gutenberg
    const selectedBlock = useSelect(select => {
        // Check if WordPress data is available
        if (!select || !select('core/block-editor')) {
            return null;
        }
        return select('core/block-editor').getSelectedBlock();
    }, []);

    // Get block attributes including viewMode
    const blockAttributes = useSelect(select => {
        if (!select || !select('core/block-editor') || !selectedBlock) {
            return null;
        }
        return select('core/block-editor').getBlock(selectedBlock.clientId)?.attributes;
    }, [selectedBlock]);

    // Get dispatch functions
    const { updateBlockAttributes } = useDispatch('core/block-editor') || {};

    // Check if a block should load Monaco
    const shouldLoadMonaco = useCallback((block) => {
        if (!block) return false;

        // Check if it's the main dblocks-codepro block
        const isDblocksCodepro = block.name === 'dblocks/codepro';
        
        // Only proceed if it's a Code Pro block
        if (!isDblocksCodepro) {
            return false;
        }

        // Get block attributes
        const viewMode = block.attributes?.viewMode;
        const syntaxHighlight = block.attributes?.syntaxHighlight;

        // Only load Monaco for Advanced Custom HTML variation in split mode
        if (syntaxHighlight === false && viewMode === 'split') {
            return true;
        }

        // Don't load Monaco for any other cases
        return false;
    }, []);

	// Sync Monaco content back to block
	const syncContentToBlock = useCallback((newContent) => {
		const targetBlockId = currentBlockIdRef.current;

		// Basic guards
		if (!targetBlockId || isDisposing) {
			return;
		}

		// Resolve the latest block data by id to avoid stale selectedBlock
		const be = (wp && wp.data && wp.data.select) ? wp.data.select('core/block-editor') : null;
		const targetBlock = be ? be.getBlock(targetBlockId) : null;
		if (!targetBlock) {
			return;
		}

		const attrs = targetBlock.attributes || {};
		// Only sync for Advanced Custom HTML in split mode
		if (!(attrs.syntaxHighlight === false && attrs.viewMode === 'split')) {
			return;
		}

		if (!updateBlockAttributes) {
			return;
		}

		try {
			// Decide which attribute to write based on the actual target block
			const attributesToUpdate = {};
			if (attrs.content !== undefined) attributesToUpdate.content = newContent;
			if (attrs.html !== undefined) attributesToUpdate.html = newContent;
			if (attrs.code !== undefined) attributesToUpdate.code = newContent;

			if (Object.keys(attributesToUpdate).length > 0) {
				updateBlockAttributes(targetBlockId, attributesToUpdate);
			}
		} catch (error) {
			console.error('Failed to sync content to block:', error);
		}
	}, [updateBlockAttributes, isDisposing]);

	// Destroy Monaco editor
	const destroyMonaco = useCallback(() => {
		if (isDisposing || !monacoEditor) return;
		
		setIsDisposing(true);
		
		try {
			// Cancel any pending sync operations
			if (window.monacoSyncTimeout) {
				clearTimeout(window.monacoSyncTimeout);
				window.monacoSyncTimeout = null;
			}

			// Remove resize listener
			if (resizeHandlerRef.current) {
				window.removeEventListener("resize", resizeHandlerRef.current);
				resizeHandlerRef.current = null;
			}

			try {
				// Dispose editor safely
				monacoEditor.dispose();
			} catch (error) {
				console.log('Monaco disposal error (non-critical):', error);
			}
			
			setMonacoEditor(null);
		} catch (error) {
			console.error('Error during Monaco disposal:', error);
		} finally {
			if (monacoInstance) {
				setMonacoInstance(null);
			}

			window.monacoEditor = null;

			// Hide the Monaco placeholder and reset height
			const placeholder = document.getElementById("monaco-placeholder");
			if (placeholder) {
				placeholder.style.display = "none";
			}
			document.documentElement.style.setProperty('--monaco-editor-height', '0px');

			setIsDisposing(false);
		}
	}, [monacoEditor, monacoInstance, isDisposing]);

	// Load Monaco editor
	const loadMonaco = useCallback(async () => {
        if (monacoInstance || isLoading) return;

        setIsLoading(true);
        try {
            // Show the Monaco placeholder and set height
            const placeholder = document.getElementById("monaco-placeholder");
            if (placeholder) {
                // Change display from none to block
                placeholder.style.display = "block";
                // Read stored height from localStorage with fallback
                let heightPx = '300px';
                try {
                    const raw = window.localStorage.getItem('dblocksEditorHeight');
                    const parsed = parseInt(raw || '400', 10);
                    const clamped = Math.min(1000, Math.max(10, Number.isFinite(parsed) ? parsed : 400));
                    heightPx = clamped + 'px';
                } catch (e) {}
                // Update the CSS root variable for proper transitions
                document.documentElement.style.setProperty('--monaco-editor-height', heightPx);
            }

            // Load Monaco using the existing configuration
            if (typeof window.loadMonacoForBlock === "function") {
                const monaco = await window.loadMonacoForBlock(
                    window.DBlocksCodePro?.pluginPath || '',
                    window,
                    document
                );

                setMonacoInstance(monaco);

                // Create editor instance
                const options = window.DBlocksSettings?.getMonacoOptions({
                    value: `<!-- Loading block content... -->`,
                    language: "html"
                }) || {};

                const editor = monaco.editor.create(containerRef.current, options);
                setMonacoEditor(editor);

                // Store reference globally
                window.monacoEditor = editor;

                // Handle window resize
                const resizeHandler = () => {
                    if (editor) {
                        editor.layout();
                    }
                };
                window.addEventListener("resize", resizeHandler);
                resizeHandlerRef.current = resizeHandler;

                // Set up content change listener
                editor.onDidChangeModelContent(() => {
                    // Don't sync if Monaco is being destroyed or we're applying programmatic updates
                    if (isDisposing || suppressContentChangeRef.current) return;
                    
                    // Debounce the sync
                    clearTimeout(window.monacoSyncTimeout);
                    window.monacoSyncTimeout = setTimeout(() => {
                        // Double-check we're not disposing before syncing
                        if (!isDisposing && !suppressContentChangeRef.current) {
                            const newContent = editor.getValue();
                            syncContentToBlock(newContent);
                        }
                    }, 100);
                });
            } else {
                console.error("Monaco loading function not available");
            }
        } catch (error) {
            console.error("Failed to load Monaco Editor:", error);
        } finally {
            setIsLoading(false);
        }
    }, [monacoInstance, isLoading, isDisposing, syncContentToBlock]);

    // Load block content into Monaco
    const loadBlockContent = useCallback(async (block) => {
        if (!block || !monacoEditor) {
            console.log('❌ loadBlockContent blocked:', { 
                hasBlock: !!block, 
                hasMonacoEditor: !!monacoEditor,
                blockId: block?.clientId,
                monacoEditorState: monacoEditor ? 'exists' : 'null'
            });
            return;
        }

        const blockId = block.clientId;
        console.log('📖 Loading content for block:', {
            blockId,
            currentBlockId,
            contentAlreadyLoaded: monacoEditor._contentLoaded
        });
        
        // Allow content loading for the same block if Monaco just became ready
        if (blockId === currentBlockId && monacoEditor._contentLoaded) {
            console.log('⏭️ Skipping content load - already loaded for this block');
            return;
        }

		// Cancel any pending sync before switching the active block context
		if (window.monacoSyncTimeout) {
			clearTimeout(window.monacoSyncTimeout);
			window.monacoSyncTimeout = null;
		}

        console.log('🔄 Setting currentBlockId to:', blockId);
        currentBlockIdRef.current = blockId;
        setCurrentBlockId(blockId);

        // Get block content
        let blockContent = '';
        if (block.attributes?.content !== undefined) {
            blockContent = block.attributes.content;
        } else if (block.attributes?.html !== undefined) {
            blockContent = block.attributes.html;
        } else if (block.attributes?.code !== undefined) {
            blockContent = block.attributes.code;
        }

        console.log('📝 Block content:', { 
            blockContent: blockContent ? (blockContent.substring(0, 100) + '...') : 'empty',
            contentLength: blockContent?.length || 0
        });

        // Update Monaco editor
        const model = monacoEditor.getModel();
        if (model) {
            // Suppress change events caused by programmatic setValue
            suppressContentChangeRef.current = true;
            model.setValue(blockContent || `<!-- Advanced Custom HTML Block: ${block.name} -->\n<!-- No HTML content available -->`);
            // Allow events again after a tick
            setTimeout(() => { suppressContentChangeRef.current = false; }, 0);
            // Mark that content has been loaded
            monacoEditor._contentLoaded = true;
            console.log('✅ Content loaded into Monaco for block:', blockId);
        } else {
            console.log('❌ No Monaco model available');
        }
    }, [monacoEditor, currentBlockId]);

    // Handle block selection changes
    useEffect(() => {
        // Don't proceed if WordPress data isn't available
        if (!wp.data || !wp.data.select || !wp.data.select('core/block-editor')) {
            return;
        }
        
        if (selectedBlock && shouldLoadMonaco(selectedBlock)) {
            // Block is eligible for Monaco
            if (!monacoInstance) {
                // Ensure currentBlockId is set before Monaco attaches listeners
                console.log('🚀 Loading Monaco for new block:', selectedBlock.clientId);
                currentBlockIdRef.current = selectedBlock.clientId;
                setCurrentBlockId(selectedBlock.clientId);
                loadMonaco();
            } else {
                // Monaco is loaded, update content
                console.log('📝 Updating Monaco content for block:', selectedBlock.clientId);
                loadBlockContent(selectedBlock);
            }
        } else {
            // Block is not eligible or no block selected
            if (monacoInstance) {
                console.log('🗑️ Destroying Monaco - block not eligible:', selectedBlock?.clientId);
                destroyMonaco();
                currentBlockIdRef.current = null;
                setCurrentBlockId(null);
            }
        }
    }, [selectedBlock, shouldLoadMonaco, monacoInstance, loadMonaco, loadBlockContent, destroyMonaco]);

    // Keep ref in sync with state for any other updates
    useEffect(() => {
        currentBlockIdRef.current = currentBlockId;
    }, [currentBlockId]);

    // Handle resize handle drag events
    const handleMouseDown = useCallback((e) => {
        // Only allow left mouse button
        if (e.button !== 0) return;
        
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--monaco-editor-height')) || 400;
        
        // Add event listeners to document
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp, { passive: false });
        
        // Prevent text selection and other default behaviors
        e.preventDefault();
        e.stopPropagation();
        
        // Add dragging class to body
        document.body.classList.add('monaco-dragging');
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        // Prevent default to avoid interfering with block editor
        e.preventDefault();
        e.stopPropagation();
        
        const deltaY = startYRef.current - e.clientY;
        const newHeight = Math.max(100, Math.min(800, startHeightRef.current + deltaY));
        
        // Update CSS variable
        document.documentElement.style.setProperty('--monaco-editor-height', newHeight + 'px');
        
        // Update localStorage
        try {
            window.localStorage.setItem('dblocksEditorHeight', String(newHeight));
        } catch (error) {
            console.warn('Failed to save editor height to localStorage:', error);
        }
    }, []);

    const handleMouseUp = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        isDraggingRef.current = false;
        
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Remove dragging class
        document.body.classList.remove('monaco-dragging');
        
        // Prevent default
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Cleanup drag event listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Load content when monacoEditor becomes available
    useEffect(() => {
        if (monacoEditor && currentBlockId && selectedBlock) {
            loadBlockContent(selectedBlock);
        }
    }, [monacoEditor, currentBlockId, selectedBlock, loadBlockContent]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            destroyMonaco();
        };
    }, [destroyMonaco]);

    // Determine theme class for handle based on settings
    const resolveThemeClass = () => {
        const win = typeof window !== 'undefined' ? window : {};
        const raw = win.dblocksCodeProSettings || {};
        let theme = raw.editor_theme || 'light';
        try {
            if (win.DBlocksSettings && typeof win.DBlocksSettings.get === 'function') {
                theme = win.DBlocksSettings.get('editor_theme', theme);
            }
        } catch (_) {}
        return String(theme).toLowerCase().includes('dark') ? 'theme-dark' : 'theme-light';
    };
    const themeClass = resolveThemeClass();

    // Don't render anything if Monaco shouldn't be loaded
    if (!selectedBlock || !shouldLoadMonaco(selectedBlock)) {
        return null;
    }

    // Don't render if WordPress data isn't available yet
    if (!wp.data || !wp.data.select || !wp.data.select('core/block-editor')) {
        return null;
    }

    return (
        <div id="monaco-placeholder" className={themeClass}>
            {/* Draggable resize handle */}
            <div 
                id="monaco-resize-handle"
                onMouseDown={handleMouseDown}
                onMouseEnter={(e) => e.currentTarget.style.cursor = 'ns-resize'}
                onMouseLeave={(e) => e.currentTarget.style.cursor = 'ns-resize'}
                title="Drag to resize editor height"
                style={{ 
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none'
                }}
            />
            <div 
                ref={containerRef} 
                id="monaco-editor-container"
                style={{ height: '100%', width: '100%' }}
            />
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#cccccc',
                    fontSize: '14px'
                }}>
                    Loading Monaco Editor...
                </div>
            )}
        </div>
    );
};

// Render the component
const { render } = wp.element;
const container = document.getElementById('monaco-placeholder');

if (container) {
    render(<MonacoEditor />, container);
}
