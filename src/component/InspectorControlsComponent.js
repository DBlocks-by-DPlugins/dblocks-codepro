import React from 'react';
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
                    <ToggleControl
                        label="Use Wrapper"
                        help="Wrap the editor content in a div to use WP output for class name, width class, etc."
                        checked={attributes.useWrapper}
                        onChange={() => setAttributes({ useWrapper: !attributes.useWrapper })}
                        __nextHasNoMarginBottom={true}
                    />

                    <ToggleControl
                        label="Scale height with content"
                        checked={attributes.scaleHeightWithContent}
                        onChange={() => setAttributes({ scaleHeightWithContent: !attributes.scaleHeightWithContent })}
                        __nextHasNoMarginBottom={true}
                    />
                    {!attributes.scaleHeightWithContent && (
                        <UnitControl
                            label="Editor Height"
                            value={editorHeight}
                            onChange={(newHeight) => {
                                setEditorHeight(newHeight);
                                updateAttribute('editorHeight', newHeight, '/wp-json/dblocks_codepro/v1/editor-height/');
                            }}
                            onUnitChange={(newUnit) => {
                                // Find the default value for the new unit
                                const units = [
                                    { value: 'px', label: 'px', default: 500 },
                                    { value: '%', label: '%', default: 50 },
                                    { value: 'em', label: 'em', default: 25 },
                                    { value: 'rem', label: 'rem', default: 25 },
                                    { value: 'vh', label: 'vh', default: 50 }
                                ]
                                const defaultValue = units.find(unit => unit.value === newUnit)?.default || 50;
                                const newHeight = `${defaultValue}${newUnit}`;
                                setEditorHeight(newHeight);
                                updateAttribute('editorHeight', newHeight, '/wp-json/dblocks_codepro/v1/editor-height/');
                            }}
                            units={[
                                { value: 'px', label: 'px', default: 500 },
                                { value: '%', label: '%', default: 50 },
                                { value: 'em', label: 'em', default: 25 },
                                { value: 'rem', label: 'rem', default: 25 },
                                { value: 'vh', label: 'vh', default: 50 }
                            ]}
                            min={10}
                            max={1000}
                        />
                    )}
                </PanelBody>
                <PanelBody title="Syntax Highlighting">
                    <ToggleControl
                        label="Activate Syntax Highlighting"
                        checked={syntaxHighlight}
                        onChange={() => {
                            setSyntaxHighlight(!syntaxHighlight);
                            setAttributes({ syntaxHighlight: !syntaxHighlight });
                        }}
                        __nextHasNoMarginBottom={true}
                    />
                    {syntaxHighlight && (
                        <>
                            <ToggleControl
                                label="FrontEnd Dark Theme"
                                checked={syntaxHighlightTheme === "dark"}
                                onChange={toggleSyntaxHighlightTheme}
                                __nextHasNoMarginBottom={true}
                            />
                            <SelectControl
                                label="Language"
                                value={editorLanguage}
                                options={[
                                    { label: "HTML", value: "html" },
                                    { label: "CSS", value: "css" },
                                    { label: "SCSS", value: "scss" },
                                    { label: "JavaScript", value: "js" },
                                    { label: "PHP", value: "php" },
                                    { label: "TypeScript", value: "typescript" },
                                    { label: "Bash", value: "bash" },
                                    { label: "Twig", value: "twig" },
                                    { label: "YAML", value: "yaml" },
                                    { label: "Plaintext", value: "plaintext" },
                                    { label: "JSON", value: "json" },
                                ]}
                                onChange={changeEditorLanguage}
                            />
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
                    />

                </PanelBody>
            </Panel>
        </InspectorControls>
    );
};

export default InspectorControlsComponent;
