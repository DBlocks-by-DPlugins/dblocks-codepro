// BlockControlsComponent.js

import React from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';

const BlockControlsComponent = ({ viewMode, setViewMode }) => {
    return (
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => setViewMode('code')}
                    isActive={viewMode === 'code'}
                >
                    HTML
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setViewMode('preview')}
                    isActive={viewMode === 'preview'}
                >
                    Preview
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setViewMode('split')}
                    isActive={viewMode === 'split'}
                >
                    Split
                </ToolbarButton>
            </ToolbarGroup>
        </BlockControls>
    );
};

export default BlockControlsComponent;
