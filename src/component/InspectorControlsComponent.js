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

    const handleHeightChange = (newHeight) => {
        // Ensure the value always has 'px' at the end
        const heightInPx = newHeight.toString().endsWith('px') 
            ? newHeight 
            : `${newHeight}px`;
        
        setEditorHeight(heightInPx);
        updateAttribute('editorHeight', heightInPx, '/wp-json/dblocks_codepro/v1/editor-height/');
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

                    <div className="togglecontrol--with-info">
                        <ToggleControl
                            label="Activate Syntax Highlighting"
                            checked={syntaxHighlight}
                            onChange={() => {
                                const newState = !syntaxHighlight;
                                setSyntaxHighlight(newState);
                                // Update both syntaxHighlight and scaleHeightWithContent
                                setAttributes({ 
                                    syntaxHighlight: newState,
                                    // When highlighting is ON: enable scale height with content
                                    // When highlighting is OFF: disable scale height with content
                                    scaleHeightWithContent: newState
                                });
                            }}
                            __nextHasNoMarginBottom={true}
                        />
                        <div className="togglecontrol--with-info__icon-wrapper">
                            <Icon icon={help} size={20} />
                            <p>If this is disabled code will be injected as HTML, otherwise the code will be displayed with syntax highlighting as code snippet preview.</p>
                        </div>
                    </div>
                    {syntaxHighlight && (
                        <div style={{ borderLeft: '1px solid #a8a8a8', paddingLeft: '20px 20px 0 20px', marginLeft: '10px' }}>
                            <ToggleControl
                                label="FrontEnd Dark Theme"
                                checked={syntaxHighlightTheme === "dark"}
                                onChange={toggleSyntaxHighlightTheme}
                                __nextHasNoMarginBottom={true}
                            />
                            <SelectControl
                                label="Language"
                                value={editorLanguage}
                                options={Languages}
                                onChange={changeEditorLanguage}
                            />
                        </div>
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
                    />

                </PanelBody>
            </Panel>
        </InspectorControls>
    );
};

export default InspectorControlsComponent;
