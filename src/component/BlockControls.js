// BlockControlsComponent.js

import { Toolbar, ToolbarDropdownMenu } from '@wordpress/components';

import React, { useState } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Button } from '@wordpress/components';
import Languages from './Languages';
import { Icon, seen, pageBreak, code } from '@wordpress/icons';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setSyntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].value);

    const viewModeTitles = {
        preview: 'Preview',
        split: 'Split',
    };

    // Find the label of the selected language
    const selectedLanguageLabel = Languages.find(language => language.value === selectedLanguage)?.label || '';

    return (
        <BlockControls>
            <ToolbarGroup>
                <ToolbarDropdownMenu
                    text={viewModeTitles[viewMode] || 'Select View Mode'}
                    icon={viewMode === 'code' ? code : viewMode === 'preview' ? seen : pageBreak}
                    label="View Mode"
                    controls={[
                        {
                            title: 'Preview',
                            onClick: () => setViewMode('preview'),
                            isActive: viewMode === 'preview',
                            icon: seen,
                        },
                        {
                            title: 'Split',
                            onClick: () => setViewMode('split'),
                            isActive: viewMode === 'split',
                            icon: pageBreak,
                        },
                    ]}
                />
            </ToolbarGroup>
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
