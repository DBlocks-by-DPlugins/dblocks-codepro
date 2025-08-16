import React from 'react';
import { Icon, help } from '@wordpress/icons';
import Languages from './Languages';

import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';

const THEME_OPTIONS = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' }
];

const PADDING_STYLE = { padding: '10px 0px 10px 15px' };

const InspectorControlsComponent = ({
    attributes,
    setAttributes,
    syntaxHighlight,
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
    updateAttribute,
    displayLanguage,
    copyButton
}) => {
    const handleFontSizeChange = (newFontSize) => {
        setFontSize(newFontSize);
        updateAttribute('editorFontSize', newFontSize, '/wp-json/dblocks_codepro/v1/editor-font-size/');
    };

    const handleHeightChange = (newHeight) => {
        const heightInPx = newHeight.toString().endsWith('px') ? newHeight : `${newHeight}px`;
        setEditorHeight(heightInPx);
        localStorage.setItem('dblocks_editor_height', heightInPx);
        setAttributes({ editorHeight: heightInPx });
    };

    const handleFrontEndThemeChange = () => {
        toggleSyntaxHighlightTheme();
    };

    const handleThemeChange = () => {
        toggleTheme();
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
                <PanelBody title="Element Settings" key={`inspector-${syntaxHighlight ? 'syntax' : 'executor'}`}>
                    <div className="togglecontrol--with-info">
                        <ToggleControl
                            label="Use Wrapper"
                            checked={attributes.useWrapper}
                            onChange={handleWrapperChange}
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

                    <div className="variation-info">
                        <p><strong>Block Type:</strong> {syntaxHighlight ? 'Syntax Highlighter' : 'Code Executor'}</p>
                        <p><small>To change between code execution and syntax highlighting, use block variations from the inserter.</small></p>
                    </div>

                    {/* Language selection - available for both variations */}
                    <SelectControl
                        label="Language"
                        value={editorLanguage}
                        options={Languages}
                        onChange={changeEditorLanguage}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />

                    {/* Code Executor specific options */}
                    {!syntaxHighlight && (
                        <div style={PADDING_STYLE}>
                            <ToggleControl
                                label="Scale Height with Content"
                                checked={attributes.scaleHeightWithContent}
                                onChange={(value) => setAttributes({ scaleHeightWithContent: value })}
                                __nextHasNoMarginBottom={true}
                            />
                        </div>
                    )}

                    {/* Syntax Highlighter specific options */}
                    {syntaxHighlight && (
                        <div style={PADDING_STYLE}>
                            <SelectControl
                                label="Front End Theme"
                                value={syntaxHighlightTheme}
                                options={THEME_OPTIONS}
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

                    <hr />

                    <h2>Editor Global Settings</h2>
                    <SelectControl
                        label="Editor Theme"
                        value={theme === 'vs-dark' ? 'dark' : 'light'}
                        options={THEME_OPTIONS}
                        onChange={handleThemeChange}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
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
