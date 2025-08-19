import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState, useCallback } from '@wordpress/element';
import { DBlocksSettings } from '../../global/utils/settings.js';

// Monaco editor instance cache to prevent reloading when switching blocks
const monacoEditorCache = {
	instances: new Map(), // Map of clientId -> editor instance
	isInitializing: false
};

export default function SyntaxHighlighter({ 
	content, 
	viewMode, 
	syntaxHighlight, 
	scaleHeightWithContent, 
	setAttributes, 
	clientId,
	editorLanguage
}) {
	const monacoContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [monacoReady, setMonacoReady] = useState(false);
	const [editorHeight, setEditorHeight] = useState(300);
	const previousLanguageRef = useRef(editorLanguage);

	// Ensure we always have a valid language
	const currentLanguage = editorLanguage || 'html';

	// Function to calculate and update editor height based on content
	const updateEditorHeight = useCallback(() => {
		if (editorRef.current) {
			try {
				// Get the actual content height from Monaco
				const contentHeight = editorRef.current.getContentHeight();
				
				// Simple height calculation with padding
				const padding = 30; // Padding for borders, scrollbars, etc.
				const calculatedHeight = Math.max(200, contentHeight + padding);
				
				// Update the container height
				setEditorHeight(calculatedHeight);
				
				// Force Monaco to recalculate its layout
				editorRef.current.layout();
				
			} catch (error) {
				console.warn('Error updating editor height:', error);
			}
		}
	}, []);

	// Default Monaco editor options
	const defaultMonacoOptions = {
		theme: 'vs',
		lineNumbers: 'on',
		fontSize: 14,
		lineHeight: 20,
		wordWrap: 'on',
		minimap: { enabled: false },
		automaticLayout: true,
		scrollBeyondLastLine: false
	};

	// Force editor recreation when switching TO syntax highlighter variation
	useEffect(() => {
		if (syntaxHighlight) {
			
			// Clear any cached editor for this client
			if (monacoEditorCache.instances.has(clientId)) {
				const cachedEditor = monacoEditorCache.instances.get(clientId);
				if (cachedEditor) {
					cachedEditor.dispose();
				}
				monacoEditorCache.instances.delete(clientId);
			}
			
			// Reset refs and state
			editorRef.current = null;
			setMonacoReady(false);
			
			// Clear container
			if (monacoContainerRef.current) {
				monacoContainerRef.current.innerHTML = '';
			}
		}
	}, [syntaxHighlight, clientId]);

	// Update editor language when editorLanguage changes
	useEffect(() => {
		if (editorRef.current && editorLanguage && editorLanguage !== previousLanguageRef.current) {
			console.log('Language change detected:', { from: previousLanguageRef.current, to: editorLanguage });
			
			// Instead of trying to change the model language, recreate the editor
			// This is more reliable and matches how the working plugin handles changes
			if (monacoEditorCache.instances.has(clientId)) {
				// Dispose the old editor instance
				editorRef.current.dispose();
				monacoEditorCache.instances.delete(clientId);
				editorRef.current = null;
				setMonacoReady(false);
				
				// Force recreation by clearing the container
				if (monacoContainerRef.current) {
					monacoContainerRef.current.innerHTML = '';
				}
				
				// Trigger the main useEffect to recreate the editor
				previousLanguageRef.current = editorLanguage;
			}
		}
	}, [editorLanguage, clientId]);

	// Update editor content when content prop changes
	useEffect(() => {
		if (editorRef.current && content !== editorRef.current.getValue()) {
			editorRef.current.setValue(content);
			// Update height after content change
			setTimeout(() => updateEditorHeight(), 50);
		}
	}, [content, updateEditorHeight]);

	// Add resize observer for dynamic height updates
	useEffect(() => {
		if (editorRef.current && monacoReady) {
			// Use Monaco's built-in resize observer
			const resizeObserver = new ResizeObserver(() => {
				updateEditorHeight();
			});
			
			resizeObserver.observe(monacoContainerRef.current);
			
			// Initial height update when editor becomes ready
			updateEditorHeight();
			
			return () => {
				resizeObserver.disconnect();
			};
		}
	}, [monacoReady, updateEditorHeight]);

	useEffect(() => {

		// Only create editor when we have the container
		if (!monacoContainerRef.current) {
			return;
		}

		// Check if we already have a cached editor instance
		if (monacoEditorCache.instances.has(clientId)) {
			editorRef.current = monacoEditorCache.instances.get(clientId);
			
			// Update content in cached editor if it's different
			if (editorRef.current && content !== editorRef.current.getValue()) {
				editorRef.current.setValue(content);
				// Update height after content change
				setTimeout(() => updateEditorHeight(), 50);
			}
			
			setMonacoReady(true);
			return;
		}

		// Detect if we're in an iframe context (like the working plugin)
		const iframe = document.querySelector('[name="editor-canvas"]');
		const contextWindow = iframe ? iframe.contentWindow : window;
		const contextDoc = iframe ? iframe.contentWindow.document : document;

		// Load Monaco using the new approach
		const loadMonaco = async () => {
			try {
				// Get plugin path from the global variable
				const pluginPath = DBlocksCodePro.pluginPath;

				// Use the global function to load Monaco in the correct context
				const monaco = await window.loadMonacoForBlock(pluginPath, contextWindow, contextDoc);

				// Create Monaco editor instance
				if (!editorRef.current) {
					try {
						
						// Get Monaco options with fallback
						let monacoOptions = {};
						try {
							if (DBlocksSettings && typeof DBlocksSettings.getMonacoOptions === 'function') {
								monacoOptions = DBlocksSettings.getMonacoOptions({
									value: content,
									language: currentLanguage
								});
							} else {
								console.warn('DBlocksSettings not available, using default options');
								monacoOptions = { ...defaultMonacoOptions };
							}
						} catch (error) {
							console.error('Error getting Monaco options:', error);
							monacoOptions = { ...defaultMonacoOptions };
						}
						
						editorRef.current = monaco.editor.create(monacoContainerRef.current, {
							value: content,
							language: currentLanguage,
							...monacoOptions
						});

						// Add change listener - save content immediately like the working plugin
						editorRef.current.onDidChangeModelContent(() => {
							const newContent = editorRef.current.getValue();
							if (newContent !== content) {
								setAttributes({ content: newContent });
							}
						});

						// Listen for model content changes to update height
						editorRef.current.onDidContentSizeChange(() => {
							updateEditorHeight();
						});

						// Also listen for cursor position changes to trigger height updates
						editorRef.current.onDidChangeCursorPosition(() => {
							// Debounced height update
							clearTimeout(window.heightUpdateTimeout);
							window.heightUpdateTimeout = setTimeout(() => updateEditorHeight(), 100);
						});

						// Cache the editor instance to prevent recreation
						monacoEditorCache.instances.set(clientId, editorRef.current);
						setMonacoReady(true);
						previousLanguageRef.current = currentLanguage;
						
						// Initial height calculation - use multiple timeouts to ensure it works
						setTimeout(() => updateEditorHeight(), 100);
						setTimeout(() => updateEditorHeight(), 500);
						setTimeout(() => updateEditorHeight(), 1000);
						
						// Force immediate height update
						requestAnimationFrame(() => updateEditorHeight());
					} catch (error) {
						console.error('Failed to create Monaco editor:', error);
					}
				}
			} catch (error) {
				console.error('Failed to load Monaco:', error);
			}
		};

		loadMonaco();

		// Cleanup on unmount
		return () => {
			// Don't dispose the editor if it's cached
			if (editorRef.current && !monacoEditorCache.instances.has(clientId)) {
				editorRef.current.dispose();
				editorRef.current = null;
			}
		};
	}, [content, setAttributes, clientId, currentLanguage, monacoReady, syntaxHighlight]);

	return (
		<div className="dblocks-syntax-highlighter">
			<div 
				ref={monacoContainerRef} 
				className="dblocks-monaco-editor"
				style={{ 
					height: `${editorHeight}px`, 
					border: '1px solid #ccc',
					display: monacoReady ? 'block' : 'none'
				}}
			></div>
		</div>
	);
}