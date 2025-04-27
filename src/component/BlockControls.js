// BlockControlsComponent.js

import React, { useState } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, ToolbarItem, ToolbarDropdownMenu } from '@wordpress/components';
import Languages from './Languages';
import { Icon, seen, pageBreak, code } from '@wordpress/icons';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setSyntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].value);

    // Find the label of the selected language
    const selectedLanguageLabel = Languages.find(language => language.value === selectedLanguage)?.label || '';

    return (
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    icon={viewMode === 'preview' ? seen : pageBreak}
                    label={viewMode === 'preview' ? 'Switch to Split View' : 'Switch to Preview'}
                    onClick={() => setViewMode(viewMode === 'preview' ? 'split' : 'preview')}
                >
                    {viewMode === 'preview' ? 'Preview' : 'Split'}
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup>
                <ToolbarItem>
                    {() => (
                        <ToolbarButton
                            icon={syntaxHighlight ? 'yes' : 'no'}
                            label="Highlighting"
                            isPressed={syntaxHighlight}
                            onClick={() => {
                                setSyntaxHighlight(!syntaxHighlight);
                                setAttributes({ syntaxHighlight: !syntaxHighlight });
                            }}
                        >
                            {syntaxHighlight ? 'Highlighting On' : 'Highlighting Off'}
                        </ToolbarButton>
                    )}
                </ToolbarItem>
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
