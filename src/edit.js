import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { emmetHTML } from 'emmet-monaco-es';
import './editor.scss';

export default function Edit() {
	const editorContainerRef = useRef(null);

	useEffect(() => {
		const loadMonacoEditorScript = () => {
			const iframe = document.querySelector('.editor-canvas__iframe');
			if (iframe && iframe.contentWindow) {
				const iframeWindow = iframe.contentWindow;
				const iframeDoc = iframe.contentWindow.document;

				// Inject Monaco loader script into the iframe
				const script = iframeDoc.createElement('script');
				script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs/loader.js';
				script.onload = () => {
					iframeWindow.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs' }});
					iframeWindow.require(['vs/editor/editor.main'], () => {
						const monaco = iframeWindow.monaco;

						// Create Monaco Editor instance
						const editor = monaco.editor.create(editorContainerRef.current, {
							value: "<!-- some comment -->",
							language: "html",
							theme: "vs-dark",
						});

						// Initialize Emmet
						emmetHTML(monaco);
					});
				};
				iframeDoc.body.appendChild(script);
			}
		};

		loadMonacoEditorScript();
	}, []);

	return (
		<div {...useBlockProps()}>
			<h2>{__('Test', 'text-domain')}</h2>
			<div ref={editorContainerRef} style={{ height: '50vh' }} />
		</div>
	);
}
