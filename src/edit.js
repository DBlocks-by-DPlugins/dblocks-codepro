import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { emmetHTML } from 'emmet-monaco-es';
import './editor.scss';

const MONACO_PATH = '/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs';

export default function Edit({ attributes, setAttributes }) {
    const { content } = attributes;
    const editorContainerRef = useRef(null);
    const editorInstanceRef = useRef(null);

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
                value: content || '<!-- some comment -->',
                language: 'html',
                automaticLayout: true
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

        const iframe = document.querySelector('.editor-canvas__iframe');
        if (iframe && iframe.contentWindow) {
            // Load Monaco Editor in the iframe
            loadMonacoEditorScript(iframe.contentWindow, iframe.contentWindow.document);
        } else {
            // Load Monaco Editor in the main document
            loadMonacoEditorScript(window, document);
        }

        // Cleanup editor instance on component unmount
        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
            }
        };
    }, []); // Run this effect only once when the component mounts

    // Update the editor content if the `content` attribute changes
    useEffect(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== content) {
            editorInstanceRef.current.setValue(content);
        }
    }, [content]);

    return (
        <div {...useBlockProps()}>
            <h2>{__('Your Block Title 2', 'text-domain')}</h2>
            <div ref={editorContainerRef} style={{ height: '50vh' }} />
        </div>
    );
}
