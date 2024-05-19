import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { emmetHTML } from 'emmet-monaco-es';
import './editor.scss';

const MONACO_PATH = '/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs';

export default function Edit() {
	const editorContainerRef = useRef(null);

	useEffect(() => {
		const isMonacoLoaderScriptPresent = (contextDoc) => {
			return Array.from(contextDoc.scripts).some(script => script.src.includes(`${MONACO_PATH}/loader.js`));
		};

		const initializeMonacoEditor = (contextWindow, monaco) => {
			const editor = monaco.editor.create(editorContainerRef.current, {
				value: "<!-- some comment -->",
				language: "html"
			});
			emmetHTML(monaco);
		};

		const loadMonacoEditorScript = (contextWindow, contextDoc) => {
			if (isMonacoLoaderScriptPresent(contextDoc)) {
				contextWindow.require.config({ paths: { 'vs': `${contextWindow.location.origin}${MONACO_PATH}` }});
				contextWindow.require(['vs/editor/editor.main'], () => {
					initializeMonacoEditor(contextWindow, contextWindow.monaco);
				});
			} else {
				const script = contextDoc.createElement('script');
				script.src = `${contextWindow.location.origin}${MONACO_PATH}/loader.js`;
				script.onload = () => {
					contextWindow.require.config({ paths: { 'vs': `${contextWindow.location.origin}${MONACO_PATH}` }});
					contextWindow.require(['vs/editor/editor.main'], () => {
						initializeMonacoEditor(contextWindow, contextWindow.monaco);
					});
				};
				contextDoc.body.appendChild(script);
			}
		};

		const iframe = document.querySelector('.editor-canvas__iframe');
		if (iframe && iframe.contentWindow) {
			// Load Monaco Editor in the iframe
			loadMonacoEditorScript(iframe.contentWindow, iframe.contentWindow.document);
		} else {
			// Load Monaco Editor in the main document
			loadMonacoEditorScript(window, document);
		}
	}, []);

	return (
		<div {...useBlockProps()}>
			<h2>{__('Test', 'text-domain')}</h2>
			<div ref={editorContainerRef} style={{ height: '50vh' }} />
		</div>
	);
}
