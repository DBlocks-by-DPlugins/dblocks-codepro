// BlockControlsComponent.js

import { Toolbar, ToggleControl, ToolbarDropdownMenu } from '@wordpress/components';


import React, { useState } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import Languages from './Languages';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setSyntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].value);

    // Find the label of the selected language
    const selectedLanguageLabel = Languages.find(language => language.value === selectedLanguage)?.label || '';

    return (
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => setViewMode('code')}
                    isActive={viewMode === 'code'}
                >
                    HTML
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setViewMode('preview')}
                    isActive={viewMode === 'preview'}
                >
                    Preview
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setViewMode('split')}
                    isActive={viewMode === 'split'}
                >
                    Split
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup>
                <ToggleControl
                    className="toggle-in-toolbar"
                    label="Highlighting"
                    checked={syntaxHighlight}
                    onChange={() => {
                        setSyntaxHighlight(!syntaxHighlight);
                        setAttributes({ syntaxHighlight: !syntaxHighlight });
                    }}
                    __nextHasNoMarginBottom={true}
                />
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
