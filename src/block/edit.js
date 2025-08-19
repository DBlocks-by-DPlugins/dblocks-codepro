import { useBlockProps } from '@wordpress/block-editor';
import { useState, useRef, useEffect } from '@wordpress/element';

// Components
import BlockControlsComponent from './components/BlockControls.js';
import InspectorControlsComponent from './components/InspectorControls.js';

// Variations
import AdvancedCustomHtml from './variations/advanced-custom-html.js';
import SyntaxHighlighter from './variations/syntax-highlighter.js';

// Constants and utilities
import {
	getVariationType,
	VARIATION_TYPES
} from './constants/index.js';

// Import settings utility for block editor
import { DBlocksSettings } from '../global/utils/settings.js';

// Styles
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
	const { content, viewMode: initialViewMode, scaleHeightWithContent } = attributes || {};
	const [viewMode, setViewMode] = useState(initialViewMode);
	const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || "html");
	const [showEditor, setShowEditor] = useState(false);
	const [editorNeedsRefresh, setEditorNeedsRefresh] = useState(false);
	const previousViewModeRef = useRef(viewMode);
	const editorInstanceRef = useRef(null);

	// Use local state for syntaxHighlight like the working example
	const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);

	const variationType = getVariationType(attributes);

	// Make DBlocksSettings available globally for Monaco config
	useEffect(() => {
		if (typeof window !== 'undefined' && DBlocksSettings) {
			window.DBlocksSettings = DBlocksSettings;
			// console.log('DBlocks: Settings utility loaded in block editor', DBlocksSettings);
		} else {
			console.warn('DBlocks: Settings utility not available in block editor', { DBlocksSettings, window: typeof window });
		}
	}, []);

	// Sync syntaxHighlight state with attributes when variation changes
	useEffect(() => {
		if (attributes.syntaxHighlight !== syntaxHighlight) {
			setSyntaxHighlight(attributes.syntaxHighlight);
		}
	}, [attributes.syntaxHighlight]);

	// Handle variation-specific attribute changes - set initial view mode only
	useEffect(() => {
		// Set initial view mode based on variation type, but don't force it
		if (syntaxHighlight && !attributes.viewMode) {
			// Syntax Highlighter: default to preview mode
			setViewMode('preview');
			setAttributes({ viewMode: 'preview' });
		} else if (!syntaxHighlight && !attributes.viewMode) {
			// Advanced Custom HTML: default to split mode
			setViewMode('split');
			setAttributes({ viewMode: 'split' });
		}
	}, [syntaxHighlight, attributes.viewMode, setAttributes]);

	// Handle view mode change
	const handleViewModeChange = (newViewMode) => {
		previousViewModeRef.current = viewMode;
		setViewMode(newViewMode);
		setAttributes({ viewMode: newViewMode });

		if (newViewMode === 'split') {
			setShowEditor(true);
			setEditorNeedsRefresh(true);
		}
	};

	const changeEditorLanguage = (language) => {
		setEditorLanguage(language);
		setAttributes({ editorLanguage: language });

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

	// Handle syntax highlight changes
	useEffect(() => {
		if (showEditor && viewMode === 'split') {
			setEditorNeedsRefresh(true);
		}
	}, [syntaxHighlight]);

	// Function to toggle syntax highlighting (kept for potential future use)
	const toggleSyntaxHighlight = (newSyntaxHighlight) => {
		setSyntaxHighlight(newSyntaxHighlight);
		setAttributes({ syntaxHighlight: newSyntaxHighlight });
	};

	// Get block props safely
	const blockProps = useBlockProps();


	return (
		<>
			<InspectorControlsComponent
				attributes={attributes}
				setAttributes={setAttributes}
			/>
			<div {...blockProps}>
				<BlockControlsComponent
					viewMode={viewMode}
					setViewMode={handleViewModeChange}
					syntaxHighlight={syntaxHighlight}
					setAttributes={setAttributes}
					editorLanguage={editorLanguage}
					changeEditorLanguage={changeEditorLanguage}
				/>


				{variationType === VARIATION_TYPES.ADVANCED_CUSTOM_HTML && (
					<>
						<AdvancedCustomHtml
							content={content}
							viewMode={viewMode}
							syntaxHighlight={syntaxHighlight}
							scaleHeightWithContent={scaleHeightWithContent}
							setAttributes={setAttributes}
						/>
					</>
				)}

				{variationType === VARIATION_TYPES.SYNTAX_HIGHLIGHTER && (
					<>
						<SyntaxHighlighter
							content={content}
							viewMode={viewMode}
							syntaxHighlight={syntaxHighlight}
							scaleHeightWithContent={scaleHeightWithContent}
							setAttributes={setAttributes}
							clientId={clientId}
							editorLanguage={editorLanguage}
						/>
					</>
				)}
			</div>
		</>
	);
}