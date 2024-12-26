// BlockControlsComponent.js

import { Toolbar, ToggleControl, ToolbarDropdownMenu } from '@wordpress/components';


import React, { useState } from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import Languages from './Languages';
import { Icon, seen, pageBreak, code } from '@wordpress/icons';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight, setSyntaxHighlight, setAttributes, editorLanguage, changeEditorLanguage }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].value);

    const viewModeTitles = {
        code: 'Code',
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
                            title: 'Code',
                            onClick: () => setViewMode('code'),
                            isActive: viewMode === 'code',
                            icon: code,
                        },
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
