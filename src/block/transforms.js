import { createBlock } from '@wordpress/blocks';

const DEFAULT_ATTRIBUTES = {
    viewMode: 'split',
    syntaxHighlight: false,
    useWrapper: true,
    editorLanguage: 'html',
    scaleHeightWithContent: false,
    editorHeight: 400
};

// Attributes for Advanced Custom HTML variation
const ADVANCED_HTML_ATTRIBUTES = {
    viewMode: 'split',
    syntaxHighlight: false,
    useWrapper: true,
    editorLanguage: 'html',
    scaleHeightWithContent: false,
    editorHeight: 400
};

const SUPPORTED_BLOCKS = ['core/html', 'core/code', 'core/preformatted'];

const transforms = {
    from: [
        {
            type: 'block',
            blocks: SUPPORTED_BLOCKS,
            transform: (blockAttributes) => {
                // Safety check for blockAttributes
                if (!blockAttributes || typeof blockAttributes !== 'object') {
                    console.warn('DBlocks: Invalid block attributes for transform:', blockAttributes);
                    blockAttributes = {};
                }
                
                const { content, ...attributes } = blockAttributes;
                
                // Transform to Advanced Custom HTML variation
                return createBlock('dblocks/codepro', {
                    content: content || '',
                    ...ADVANCED_HTML_ATTRIBUTES,
                    // Preserve any existing attributes that might be compatible
                    ...attributes
                });
            },
        },
        {
            type: 'raw',
            priority: 20,
            isMatch: (node) => {
                return (
                    node.nodeName === 'PRE' &&
                    node.firstChild &&
                    node.firstChild.nodeName === 'CODE'
                );
            },
            transform: (node) => {
                // Safety check for node
                if (!node || !node.firstChild) {
                    console.warn('DBlocks: Invalid node for PRE>CODE transform:', node);
                    return createBlock('dblocks/codepro', {
                        content: '',
                        ...ADVANCED_HTML_ATTRIBUTES
                    });
                }
                
                const content = node.firstChild.textContent || '';
                return createBlock('dblocks/codepro', {
                    content: content,
                    ...ADVANCED_HTML_ATTRIBUTES
                });
            },
        },
        {
            type: 'raw',
            priority: 10,
            isMatch: (node) => {
                return node.nodeName === 'PRE';
            },
            transform: (node) => {
                // Safety check for node
                if (!node) {
                    console.warn('DBlocks: Invalid node for PRE transform:', node);
                    return createBlock('dblocks/codepro', {
                        content: '',
                        ...ADVANCED_HTML_ATTRIBUTES
                    });
                }
                
                const content = node.textContent || '';
                return createBlock('dblocks/codepro', {
                    content: content,
                    ...ADVANCED_HTML_ATTRIBUTES
                });
            },
        },
        {
            type: 'raw',
            priority: 15,
            isMatch: (node) => {
                return node.nodeName === 'CODE';
            },
            transform: (node) => {
                // Safety check for node
                if (!node) {
                    console.warn('DBlocks: Invalid node for CODE transform:', node);
                    return createBlock('dblocks/codepro', {
                        content: '',
                        ...ADVANCED_HTML_ATTRIBUTES
                    });
                }
                
                const content = node.textContent || '';
                return createBlock('dblocks/codepro', {
                    content: content,
                    ...ADVANCED_HTML_ATTRIBUTES
                });
            },
        }
    ],
    to: [
        {
            type: 'block',
            blocks: ['core/html'],
            transform: (blockAttributes) => {
                // Safety check for blockAttributes
                if (!blockAttributes || typeof blockAttributes !== 'object') {
                    console.warn('DBlocks: Invalid block attributes for HTML transform:', blockAttributes);
                    blockAttributes = {};
                }
                
                const { content } = blockAttributes;
                return createBlock('core/html', {
                    content: content || ''
                });
            },
        },
        {
            type: 'block',
            blocks: ['core/code'],
            transform: (blockAttributes) => {
                // Safety check for blockAttributes
                if (!blockAttributes || typeof blockAttributes !== 'object') {
                    console.warn('DBlocks: Invalid block attributes for CODE transform:', blockAttributes);
                    blockAttributes = {};
                }
                
                const { content } = blockAttributes;
                return createBlock('core/code', {
                    content: content || ''
                });
            },
        },
        {
            type: 'block',
            blocks: ['core/preformatted'],
            transform: (blockAttributes) => {
                // Safety check for blockAttributes
                if (!blockAttributes || typeof blockAttributes !== 'object') {
                    console.warn('DBlocks: Invalid block attributes for PREFORMATTED transform:', blockAttributes);
                    blockAttributes = {};
                }
                
                const { content } = blockAttributes;
                return createBlock('core/preformatted', {
                    content: content || ''
                });
            },
        },
        {
            type: 'block',
            blocks: ['core/paragraph'],
            transform: (blockAttributes) => {
                // Safety check for blockAttributes
                if (!blockAttributes || typeof blockAttributes !== 'object') {
                    console.warn('DBlocks: Invalid block attributes for PARAGRAPH transform:', blockAttributes);
                    blockAttributes = {};
                }
                
                const { content } = blockAttributes;
                return createBlock('core/paragraph', {
                    content: content || ''
                });
            },
        }
    ]
};

export default transforms;
