// Edit.js

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
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

    const handleEditorChange = (value) => {
        setContent(value);
        setAttributes({ content: value });
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
                        defaultLanguage={editorLanguage}
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
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        )}
                        {viewMode === 'both' && (
                            <>
                                <Editor
                                    height="30vh"
                                    defaultLanguage="html"
                                    theme={theme}
                                    value={content}
                                    options={{ automaticLayout: true, readOnly: false }}
                                    onChange={handleEditorChange}
                                />
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
