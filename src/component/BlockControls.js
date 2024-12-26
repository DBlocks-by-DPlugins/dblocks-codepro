// BlockControlsComponent.js

import { Toolbar, ToolbarDropdownMenu } from '@wordpress/components';


import React from 'react';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';

const BlockControlsComponent = ({ viewMode, setViewMode, syntaxHighlight }) => {
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
            {syntaxHighlight && (
                <ToolbarDropdownMenu
                    text={'Size'}
                    icon={null}
                    label="Select a direction"
                    controls={[
                        {
                            title: 'Up',
                            onClick: () => console.log('up'),
                        },
                        {
                            title: 'Right',
                            onClick: () => console.log('right'),
                        },
                        {
                            title: 'Down',
                            onClick: () => console.log('down'),
                        },
                        {
                            title: 'Left',
                            onClick: () => console.log('left'),
                        },
                    ]}
                />
            )}
        </BlockControls>
    );
};

export default BlockControlsComponent;
