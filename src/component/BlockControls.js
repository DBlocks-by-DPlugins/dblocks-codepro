// BlockControlsComponent.js

import { Toolbar, ToolbarDropdownMenu } from '@wordpress/components';

import React, { useState } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import Languages from './Languages';
import { Icon, seen, pageBreak, code } from '@wordpress/icons';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setSyntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].value);

    // Find the label of the selected language
    const selectedLanguageLabel = Languages.find(language => language.value === selectedLanguage)?.label || '';

    // Toggle between split and preview modes
    const toggleViewMode = () => {
        const newMode = viewMode === 'preview' ? 'split' : 'preview';
        setViewMode(newMode);
    };

    return (
        <BlockControls>
            {/* Only show view mode controls when syntax highlighting is off */}
            {!syntaxHighlight && (
                <ToolbarGroup>
                    <ToolbarButton
                        icon={viewMode === 'split' ? pageBreak : seen}
                        label={viewMode === 'split' ? 'Split View' : 'Preview'}
                        isPressed={viewMode === 'split'}
                        onClick={toggleViewMode}
                    >
                        {viewMode === 'split' ? 'Split View' : 'Preview'}
                    </ToolbarButton>
                </ToolbarGroup>
            )}
            <ToolbarGroup>
                <ToolbarButton
                    icon="editor-code"
                    label="Toggle Syntax Highlighting"
                    isPressed={syntaxHighlight}
                    onClick={() => {
                        setSyntaxHighlight(!syntaxHighlight);
                        setAttributes({ syntaxHighlight: !syntaxHighlight });
                    }}
                >
                    Highlighting
                </ToolbarButton>
            </ToolbarGroup>
            {syntaxHighlight && (
                <ToolbarGroup>
                    <ToolbarDropdownMenu
                        text={selectedLanguageLabel}
                        icon={null}
                        label="Select a language"
                        controls={Languages.map(language => ({
                            title: language.label,
                            onClick: () => {
                                setSelectedLanguage(language.value);
                                changeEditorLanguage(language.value);
                                console.log(language.value);
                            },
                        }))}
                    />
                </ToolbarGroup>
            )}
        </BlockControls>
    );
};

export default BlockControlsComponent;
