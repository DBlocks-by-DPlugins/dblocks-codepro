import React from 'react';
import { Icon, help, external } from '@wordpress/icons';
import Languages from './Languages';

import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl, Button } from '@wordpress/components';





const InspectorControlsComponent = ({
    attributes,
    setAttributes,
    syntaxHighlight,
    editorLanguage,
    changeEditorLanguage,
    editorHeight,
    setEditorHeight
}) => {
    const handleHeightChange = (newHeight) => {
        const heightInPx = newHeight.toString().endsWith('px') ? newHeight : `${newHeight}px`;
        setEditorHeight(heightInPx);
        localStorage.setItem('dblocks_editor_height', heightInPx);
        setAttributes({ editorHeight: heightInPx });
    };



    return (
        <InspectorControls>
            <Panel>
                <PanelBody title="Settings" key={`inspector-${syntaxHighlight ? 'syntax' : 'executor'}`}>                
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
                        <p><strong>Current Variation:</strong> {syntaxHighlight ? 'Syntax Highlighter' : 'Advanced Custom HTML'}</p>
                        <p><small>Use the variation buttons in the toolbar above to switch between Advanced Custom HTML and Syntax Highlighter modes.</small></p>
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
