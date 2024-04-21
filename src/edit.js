// Edit.js

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { Panel, PanelBody, ToggleControl } from '@wordpress/components';
import './editor.scss';
import BlockControlsComponent from './component/BlockControls.js';

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const [content, setContent] = useState(attributes.content || '<h2>Test</h2>');
    const [viewMode, setViewMode] = useState(attributes.viewMode || 'code');
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');
    const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);

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

    // Ensure the theme and syntax highlight settings persist on reload
    useEffect(() => {
        setAttributes({ theme, syntaxHighlight });
    }, [theme, syntaxHighlight, setAttributes]);

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
                    </PanelBody>
                </Panel>
            </InspectorControls>

            <div {...blockProps}>
                {syntaxHighlight ? (
                    // If syntax highlighting is enabled, show only the editor
                    <Editor
                        height="30vh"
                        defaultLanguage="html"
                        theme={theme}
                        value={content}
                        options={{ automaticLayout: true, readOnly: false }}
                        onChange={handleEditorChange}
                    />
                ) : (
                    // If syntax highlighting is disabled, show controls and conditional displays
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
