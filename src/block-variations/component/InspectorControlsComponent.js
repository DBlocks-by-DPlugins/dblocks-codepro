import React from 'react';
import { Icon, help, external } from '@wordpress/icons';
import Languages from './Languages';

import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl, Button } from '@wordpress/components';



const PADDING_STYLE = { padding: '10px 0px 10px 15px' };

const InspectorControlsComponent = ({
    attributes,
    setAttributes,
    syntaxHighlight,
    syntaxHighlightTheme,
    toggleSyntaxHighlightTheme,
    editorLanguage,
    changeEditorLanguage,
    editorHeight,
    setEditorHeight,
    updateAttribute,
    displayLanguage,
    copyButton
}) => {
    const handleHeightChange = (newHeight) => {
        const heightInPx = newHeight.toString().endsWith('px') ? newHeight : `${newHeight}px`;
        setEditorHeight(heightInPx);
        localStorage.setItem('dblocks_editor_height', heightInPx);
        setAttributes({ editorHeight: heightInPx });
    };

    const handleFrontEndThemeChange = () => {
        toggleSyntaxHighlightTheme();
    };

    const handleDisplayLanguageChange = (value) => {
        updateAttribute('displayLanguage', value, '/wp-json/dblocks_codepro/v1/display-language/');
    };

    const handleCopyButtonChange = (value) => {
        updateAttribute('copyButton', value, '/wp-json/dblocks_codepro/v1/copy-button/');
    };

    const handleWrapperChange = (value) => {
        setAttributes({ useWrapper: value });
    };



    return (
        <InspectorControls>
            <Panel>
                <PanelBody title="Settings" key={`inspector-${syntaxHighlight ? 'syntax' : 'executor'}`}>                
                    <ToggleControl
                        label="Add Block's Wrapper"
                        help="Wrap the code in a <div> block with attributes (class, id, etc.)"
                        checked={attributes.useWrapper}
                        onChange={handleWrapperChange}
                        __nextHasNoMarginBottom={true}

                    />            
                    {/* Show Editor Height only when syntax highlighting is OFF */}
                    {!syntaxHighlight && (
                        <UnitControl
                            label="Editor Height"
                            value={editorHeight}
                            onChange={handleHeightChange}
                            units={[{ value: 'px', label: 'px', default: 500 }]}
                            min={10}
                            max={1000}
                            __next40pxDefaultSize={true}
                        />
                    )}

                    <div className="variation-info">
                        <p><strong>Block Type:</strong> {syntaxHighlight ? 'Syntax Highlighter' : 'Code Executor'}</p>
                        <p><small>To change between code execution and syntax highlighting, use block variations from the inserter.</small></p>
                    </div>

                    {/* Language selection - only show when syntax highlighting is ON (not for code execution) */}
                    {syntaxHighlight && (
                        <SelectControl
                            label="Language"
                            value={editorLanguage}
                            options={Languages}
                            onChange={changeEditorLanguage}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                    )}



                    {/* Syntax Highlighter specific options */}
                    {syntaxHighlight && (
                        <div style={PADDING_STYLE}>
                            <SelectControl
                                label="Front End Theme"
                                value={syntaxHighlightTheme}
                                options={[
                                    { label: 'Light', value: 'light' },
                                    { label: 'Dark', value: 'dark' }
                                ]}
                                onChange={handleFrontEndThemeChange}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                            />
                            <ToggleControl
                                label="Display Language"
                                checked={displayLanguage}
                                onChange={handleDisplayLanguageChange}
                                __nextHasNoMarginBottom={true}
                            />
                            <ToggleControl
                                label="Copy Button"
                                checked={copyButton}
                                onChange={handleCopyButtonChange}
                                __nextHasNoMarginBottom={true}
                            />
                        </div>
                    )}
                </PanelBody>
            </Panel>
            <Panel>
                <PanelBody
                    title="Editor Global Settings"
                    initialOpen={false}
                >
                    <div style={{ padding: '16px 0' }}>
                        <p style={{ marginBottom: '12px', fontSize: '13px', color: '#50575e' }}>
                            Configure editor theme, font size, and other global settings for all DBlocks instances.
                        </p>
                        <Button
                            variant="secondary"
                            icon={external}
                            iconPosition="right"
                            onClick={() => {
                                const settingsUrl = window.location.origin + '/wp-admin/themes.php?page=dblocks-codepro-settings';
                                window.open(settingsUrl, '_blank');
                            }}
                            
                        >
                            Open Global Settings
                        </Button>
                    </div>
                </PanelBody>
            </Panel>
            {/* Keep this as this gives extra line to separate from editor settings */}
            <Panel>
                <PanelBody
                    initialOpen={false}
                >
                </PanelBody>
            </Panel>
            
        </InspectorControls>
    );
};

export default InspectorControlsComponent;
