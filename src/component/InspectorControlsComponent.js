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
    setEditorHeight,
    updateAttribute
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
        
        // Update state and localStorage first
        setEditorHeight(heightInPx);
        localStorage.setItem('dblocks_editor_height', heightInPx);
        // Then update block attribute
        setAttributes({ editorHeight: heightInPx });
    };

    const handleFrontEndThemeChange = (newTheme) => {
        toggleSyntaxHighlightTheme();
    };

    const handleThemeChange = (newTheme) => {
        toggleTheme();
    };

    const handleDisplayLanguageChange = (value) => {
        updateAttribute('displayLanguage', value, '/wp-json/dblocks_codepro/v1/display-language/');
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
                            label="Syntax Highlighting"
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

                    <div className="togglecontrol--with-info">
                        <ToggleControl
                            label="Display Language"
                            checked={attributes.displayLanguage}
                            onChange={handleDisplayLanguageChange}
                            __nextHasNoMarginBottom={true}
                        />
                        <div className="togglecontrol--with-info__icon-wrapper">
                            <Icon icon={help} size={20} />
                            <p>Show or hide the language indicator in the editor and front end.</p>
                        </div>
                    </div>

                    {syntaxHighlight && (
                        <div style={{ padding: '20px 0px 20px 20px'}}>
                            <SelectControl
                                label="Front End Theme"
                                value={syntaxHighlightTheme}
                                options={[
                                    { label: 'Light', value: 'light' },
                                    { label: 'Dark', value: 'dark' }
                                ]}
                                onChange={handleFrontEndThemeChange}
                            />
                            <SelectControl
                                label="Language"
                                value={editorLanguage}
                                options={Languages}
                                onChange={changeEditorLanguage}
                            />
                        </div>
                    )}

                    <hr />

                    <h2>Editor Global Settings</h2>
                    <SelectControl
                        label="Editor Theme"
                        value={theme === 'vs-dark' ? 'dark' : 'light'}
                        options={[
                            { label: 'Light', value: 'light' },
                            { label: 'Dark', value: 'dark' }
                        ]}
                        onChange={handleThemeChange}
                    />
                    <UnitControl
                        label="Editor Font Size"
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
