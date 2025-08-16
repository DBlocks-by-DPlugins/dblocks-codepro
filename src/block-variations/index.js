import { registerBlockType, getBlockType, addFilter } from '@wordpress/blocks';
import './style.scss';
import Edit from './Edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import CodeExecutorIcon from './component/CodeExecutorIcon';
import SyntaxHighlighterIcon from './component/SyntaxHighlighterIcon';
import metadata from '../block.json';
import transforms from './transforms';

const BLOCK_NAME = metadata.name;

// Create custom variations with custom icons
const customVariations = [
    {
        name: 'code-executor',
        title: 'Advanced Custom HTML',
        description: 'Execute and preview HTML code',
        icon: CodeExecutorIcon,
        attributes: {
            syntaxHighlight: false,
            viewMode: 'split',
            scaleHeightWithContent: false
        },
        scope: ['block', 'inserter', 'transform'],
        isActive: ['syntaxHighlight', 'viewMode', 'scaleHeightWithContent']
    },
    {
        name: 'syntax-highlighter',
        title: 'Syntax Highlighter',
        description: 'Display code with syntax highlighting',
        icon: SyntaxHighlighterIcon,
        attributes: {
            syntaxHighlight: true,
            viewMode: 'preview',
            scaleHeightWithContent: true
        },
        scope: ['block', 'inserter', 'transform'],
        isActive: ['syntaxHighlight', 'viewMode', 'scaleHeightWithContent']
    }
];

// Only register the block if it's not already registered
if (!getBlockType(BLOCK_NAME)) {
    try {
        registerBlockType(BLOCK_NAME, {
            icon: CustomIcon,
            edit: Edit,
            save,
            transforms,
            variations: customVariations,
        });
    } catch (error) {
        console.error(`Failed to register block ${BLOCK_NAME}:`, error);
    }
}

// Also override existing block type to ensure variations are updated
addFilter(
    'blocks.getBlockType',
    'dblocks-codepro/custom-variation-icons',
    (blockType, blockName) => {
        if (blockName !== BLOCK_NAME || !blockType) {
            return blockType;
        }

        // Return block type with custom variations
        return {
            ...blockType,
            variations: customVariations
        };
    }
);
