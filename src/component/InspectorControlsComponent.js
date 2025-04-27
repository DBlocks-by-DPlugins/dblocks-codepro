import React from 'react';
import { Icon, help } from '@wordpress/icons';
import Languages from './Languages';

import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';

const InspectorControlsComponent = ({
    attributes,
    setAttributes,
    syntaxHighlight,
    setSyntaxHighlight,
    syntaxHighlightTheme,
    toggleSyntaxHighlightTheme,
    editorLanguage,
    changeEditorLanguage,
    theme,
    toggleTheme,
    fontSize,
    setFontSize,
    editorHeight,
    setEditorHeight, // Receive setEditorHeight as a prop
    updateAttribute // Receive updateAttribute as a prop
}) => {
    const handleFontSizeChange = (newFontSize) => {
        setFontSize(newFontSize);
        updateAttribute('editorFontSize', newFontSize, '/wp-json/dblocks_codepro/v1/editor-font-size/');
    };

    return (
        <InspectorControls>
            <Panel>
                <PanelBody title="Element Settings">
                    <div className="togglecontrol--with-info">
                        <ToggleControl
                            label="Use Wrapper"
                            checked={attributes.useWrapper}
                            onChange={() => setAttributes({ useWrapper: !attributes.useWrapper })}
                            __nextHasNoMarginBottom={true}
                        />
                        <div className="togglecontrol--with-info__icon-wrapper">
                            <Icon icon={help} size={20} />
                            <p>Wrap the editor content in a div to use WordPress attributes such as class name, width class, etc.</p>
                        </div>
                    </div>

                    {/* Only show Editor Height control when syntax highlighting is OFF */}
                    {!syntaxHighlight && (
                        <UnitControl
                            label="Editor Height"
                            value={editorHeight}
                            onChange={(newHeight) => {
                                setEditorHeight(newHeight);
                                updateAttribute('editorHeight', newHeight, '/wp-json/dblocks_codepro/v1/editor-height/');
                            }}
                            units={[
                                { value: 'px', label: 'px', default: 500 }
                            ]}
                            min={10}
                            max={1000}
                            __next40pxDefaultSize={true}
                            __nextHasNoMarginBottom={true}
                        />
                    )}
                </PanelBody>
                <PanelBody title="Syntax Highlighting">
                    
                    <ToggleControl
                        label="Syntax Highlighting"
                        checked={syntaxHighlight}
                        onChange={() => {
                            setSyntaxHighlight(!syntaxHighlight);
                            setAttributes({ syntaxHighlight: !syntaxHighlight });
                        }}
                        __nextHasNoMarginBottom={true}
                    />
                    <p style={{ fontSize: '12px'}}>Display it as code snippet instead of running the code.</p>
                    
                
                    {syntaxHighlight && (
                        <>
                            <p style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                In highlighting mode, the editor will automatically resize based on content.
                            </p>
                            <SelectControl
                                label="FrontEnd Theme"
                                value={syntaxHighlightTheme}
                                options={[
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' }
                                ]}
                                onChange={toggleSyntaxHighlightTheme}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                            />
                            <SelectControl
                                label="Language"
                                value={editorLanguage}
                                options={Languages}
                                onChange={changeEditorLanguage}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                            />
                            <ToggleControl
                                label="Display Language Badge"
                                checked={attributes.displayLanguage || false}
                                onChange={() => {
                                    setAttributes({ displayLanguage: !attributes.displayLanguage });
                                }}
                                __nextHasNoMarginBottom={true}
                            />
                            <p style={{ fontSize: '12px'}}>Show the selected language name on the frontend.</p>
                            
                            <ToggleControl
                                label="Enable Copy Button"
                                checked={attributes.enableCopyButton || false}
                                onChange={() => {
                                    setAttributes({ enableCopyButton: !attributes.enableCopyButton });
                                }}
                                __nextHasNoMarginBottom={true}
                            />
                            <p style={{ fontSize: '12px'}}>Add a button to copy the code snippet to clipboard.</p>
                        </>
                    )}
                </PanelBody>
                <PanelBody title="Editor Global Settings" initialOpen={false}>
                    <ToggleControl
                        label="Dark Mode"
                        checked={theme === 'vs-dark'}
                        onChange={toggleTheme}
                        __nextHasNoMarginBottom={true}
                    />
                    <UnitControl
                        label="Font Size"
                        value={fontSize}
                        onChange={(newSize) => handleFontSizeChange(newSize)}
                        units={[{ value: 'px', label: 'Pixels', default: 14 }]}
                        min={10}
                        max={30}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                </PanelBody>
            </Panel>
        </InspectorControls>
    );
};

export default InspectorControlsComponent;
