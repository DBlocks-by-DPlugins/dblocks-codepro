import React, { useState, useEffect } from 'react';
import { Icon, help, external } from '@wordpress/icons';
// import Languages from './Languages';

import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl, Button } from '@wordpress/components';





const InspectorControlsComponent = ({
    attributes,
    setAttributes
}) => {
    const { syntaxHighlight, editorLanguage, useWrapper } = attributes || {};

    const readStoredHeight = () => {
        try {
            const raw = window.localStorage.getItem('dblocksEditorHeight');
            const parsed = parseInt(raw || '400', 10);
            if (!Number.isFinite(parsed)) return 400;
            return Math.min(1000, Math.max(10, parsed));
        } catch (e) {
            return 400;
        }
    };

    const [editorHeightLocal, setEditorHeightLocal] = useState(readStoredHeight);

    useEffect(() => {
        // Ensure CSS var is set to 0 on mount so footer starts closed
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--monaco-editor-height', '0px');
        }
        
        // Listen for height changes from drag operations
        const handleHeightChange = () => {
            const currentHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--monaco-editor-height')) || 0;
            if (currentHeight > 0) {
                setEditorHeightLocal(currentHeight);
            }
        };
        
        // Use MutationObserver to watch for CSS variable changes
        const observer = new MutationObserver(handleHeightChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        return () => observer.disconnect();
    }, []);

    const handleHeightChange = (value) => {
        const next = Math.min(1000, Math.max(10, parseInt(value || 400, 10)));
        setEditorHeightLocal(next);
        try {
            window.localStorage.setItem('dblocksEditorHeight', String(next));
        } catch (e) { }
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--monaco-editor-height', next + 'px');
        }
    };

    const changeEditorLanguage = (language) => {
        setAttributes({ editorLanguage: language });
    };

    const setUseWrapper = (value) => {
        setAttributes({ useWrapper: value });
    };

    return (
        <InspectorControls>
            <Panel>
                
                    {/* Show Editor Height only when syntax highlighting is OFF */}
                    {!syntaxHighlight && (
                        <PanelBody title="Settings">
                            <UnitControl
                                label="Editor Height"
                                value={editorHeightLocal}
                                onChange={handleHeightChange}
                                units={[{ value: 'px', label: 'px', default: 500 }]}
                                min={10}
                                max={1000}
                                __next40pxDefaultSize={true}
                            />

                            <ToggleControl
                                label="Use Wrapper"
                                checked={useWrapper}
                                onChange={setUseWrapper}
                            />
                        </PanelBody>
                    )}

                    {/* Language selection - only show when syntax highlighting is ON (not for code execution) */}
                    {/* {syntaxHighlight && (
                        <p>Syntax Highlighter Placeholder</p>
                        // <SelectControl
                        //     label="Language"
                        //     value={editorLanguage}
                        //     options={Languages}
                        //     onChange={changeEditorLanguage}
                        //     __next40pxDefaultSize={true}
                        //     __nextHasNoMarginBottom={true}
                        // />
                    )} */}
                
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
