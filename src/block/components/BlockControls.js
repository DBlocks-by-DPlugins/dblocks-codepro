// BlockControlsComponent.js

import React, { useState, useEffect } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, ToolbarItem, ToolbarDropdownMenu } from '@wordpress/components';
import Languages from '../utils/Languages';
import { Icon, seen, pageBreak, code } from '@wordpress/icons';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(editorLanguage || Languages[0].value);

    // Update selectedLanguage when editorLanguage prop changes
    useEffect(() => {
        if (editorLanguage) {
            setSelectedLanguage(editorLanguage);
        }
    }, [editorLanguage]);

    // Find the label of the selected language
    const selectedLanguageLabel = Languages.find(language => language.value === selectedLanguage)?.label || '';

    const handleLanguageChange = (languageValue) => {
        setSelectedLanguage(languageValue);
        changeEditorLanguage(languageValue);
        console.log('Language changed to:', languageValue);
    };

    return (
        <BlockControls>
            {/* View mode controls for Advanced Custom HTML only */}
            {!syntaxHighlight && (
                <ToolbarGroup>
                    <ToolbarButton
                        icon={viewMode === 'preview' ? seen : pageBreak}
                        label={viewMode === 'preview' ? 'Switch to Split View' : 'Switch to Preview'}
                        onClick={() => setViewMode(viewMode === 'preview' ? 'split' : 'preview')}
                    >
                        {viewMode === 'preview' ? 'Preview' : 'Split'}
                    </ToolbarButton>
                </ToolbarGroup>
            )}

            {/* Language selection for Syntax Highlighter */}
            {syntaxHighlight && (
                <ToolbarGroup>
                    <ToolbarDropdownMenu
                        text={selectedLanguageLabel}
                        icon={null}
                        label="Select a language"
                        controls={Languages.map(language => ({
                            title: language.label,
                            onClick: () => handleLanguageChange(language.value),
                        }))}
                    />
                </ToolbarGroup>
            )}
        </BlockControls>
    );
};

export default BlockControlsComponent;
