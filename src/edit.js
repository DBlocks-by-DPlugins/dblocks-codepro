// Edit.js

import { useBlockProps } from '@wordpress/block-editor';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { Panel, PanelBody } from '@wordpress/components';
import './editor.scss';
import BlockControlsComponent from './component/BlockControls.js';
import ThemeToggle from './ThemeToggle';  // Import the ThemeToggle component

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const [content, setContent] = useState(attributes.content || '<h2>Test</h2>');
    const [viewMode, setViewMode] = useState(attributes.viewMode || 'code');
    const [theme, setTheme] = useState(attributes.theme || 'vs-light');  // State for theme

    const handleEditorChange = (value) => {
        setContent(value);
        setAttributes({ content: value });
    };

    // Update theme in attributes to ensure it persists on reload
    useEffect(() => {
        setAttributes({ theme });
    }, [theme, setAttributes]);

    return (
        <div {...blockProps}>
            <BlockControlsComponent viewMode={viewMode} setViewMode={setViewMode} />
            <Panel>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </Panel>
            {(viewMode === 'code' || viewMode === 'both') && (
                <Editor
                    height="30vh"
                    defaultLanguage="html"
                    theme={theme}
                    value={content}
                    onChange={handleEditorChange}
                />
            )}
            {(viewMode === 'preview' || viewMode === 'both') && (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </div>
    );
}
