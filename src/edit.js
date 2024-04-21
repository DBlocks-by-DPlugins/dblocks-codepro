// Edit.js

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element'; // Import RawHTML
import Editor from '@monaco-editor/react';
import { emmetHTML } from 'emmet-monaco-es';
import { useState, useEffect, useRef } from 'react';
import { Panel, PanelBody, ToggleControl, SelectControl } from '@wordpress/components';
import './editor.scss';
import BlockControlsComponent from './component/BlockControls.js';

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const [content, setContent] = useState(attributes.content || '<h2>Test</h2>');
    const [viewMode, setViewMode] = useState(attributes.viewMode || 'code');
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
    const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || 'html');
    const disposeEmmetRef = useRef(null); // Define disposeEmmetRef

    const handleEditorChange = (value) => {
        setContent(value);
        setAttributes({ content: value });
        if (disposeEmmetRef.current) {
            disposeEmmetRef.current(); // Dispose the previous Emmet instance if it exists
        }
        disposeEmmetRef.current = emmetHTML(window.monaco); // Create a new Emmet instance
    };

    const toggleTheme = () => {
        setTheme(theme === 'vs-light' ? 'vs-dark' : 'vs-light');
    };

    const toggleSyntaxHighlight = () => {
        setSyntaxHighlight(!syntaxHighlight);
        setAttributes({ syntaxHighlight: !syntaxHighlight });
    };

    const changeEditorLanguage = (language) => {
        setEditorLanguage(language);
        setAttributes({ editorLanguage: language });

        // Dispose the previous Emmet instance and create a new one with the updated language
        if (disposeEmmetRef.current) {
            disposeEmmetRef.current();
        }
        disposeEmmetRef.current = emmetHTML(window.monaco); // Assuming window.monaco is available
    };

    useEffect(() => {
        setAttributes({ theme, syntaxHighlight, editorLanguage });
    }, [theme, syntaxHighlight, editorLanguage, setAttributes]);

    return (
        <>
            <InspectorControls>
                <Panel>
                    <PanelBody title="Editor Settings">
                        <ToggleControl
                            label="Dark Mode"
                            checked={theme === 'vs-dark'}
                            onChange={toggleTheme}
                        />
                        <ToggleControl
                            label="Syntax Highlighting"
                            checked={syntaxHighlight}
                            onChange={toggleSyntaxHighlight}
                        />
                        {syntaxHighlight && (
                            <SelectControl
                                label="Language"
                                value={editorLanguage}
                                options={[
                                    { label: 'HTML', value: 'html' },
                                    { label: 'CSS', value: 'css' },
                                    { label: 'SCSS', value: 'scss' },
                                    { label: 'JavaScript', value: 'js' },
                                    { label: 'PHP', value: 'php' },
                                    { label: 'TypeScript', value: 'typescript' },
                                    { label: 'Bash', value: 'bash' },
                                    { label: 'Twig', value: 'twig' },
                                    { label: 'YAML', value: 'yaml' },
                                    { label: 'Plaintext', value: 'plaintext' }, 
                                    { label: 'JSON', value: 'json' }            
                                ]}
                                onChange={changeEditorLanguage}
                            />
                        )}
                    </PanelBody>
                </Panel>
            </InspectorControls>

            <div {...blockProps}>
                {syntaxHighlight ? (
                    <Editor
                        height="30vh"
                        language={editorLanguage}
                        theme={theme}
                        value={content}
                        options={{ automaticLayout: true, readOnly: false }}
                        onChange={handleEditorChange}
                    />
                ) : (
                    <>
                        <BlockControlsComponent viewMode={viewMode} setViewMode={setViewMode} />
                        {viewMode === 'code' && (
                            <Editor
                                height="30vh"
                                defaultLanguage="html"
                                theme={theme}
                                value={content}
                                options={{ automaticLayout: true, readOnly: false }}
                                onChange={handleEditorChange}
                            />
                        )}
                        {viewMode === 'preview' && (
                            <RawHTML>{content}</RawHTML> {/* Use RawHTML here */}
                        )}
                        {viewMode === 'split' && (
                            <>
                                <Editor
                                    height="30vh"
                                    defaultLanguage="html"
                                    theme={theme}
                                    value={content}
                                    options={{ automaticLayout: true, readOnly: false }}
                                    onChange={handleEditorChange}
                                />
                                <RawHTML>{content}</RawHTML> {/* Use RawHTML here */}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
