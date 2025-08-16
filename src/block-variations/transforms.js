import { createBlock } from '@wordpress/blocks';

const DEFAULT_ATTRIBUTES = {
    viewMode: 'split',
    theme: 'vs-light',
    syntaxHighlight: false,
    syntaxHighlightTheme: 'light',
    editorLanguage: 'html'
};

const SUPPORTED_BLOCKS = ['core/html', 'core/code'];

const transforms = {
    from: [
        {
            type: 'block',
            blocks: SUPPORTED_BLOCKS,
            transform: ({ content }) => {
                return createBlock('dblocks/dblocks-codepro', {
                    content: content,
                    ...DEFAULT_ATTRIBUTES
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
                const content = node.firstChild.textContent;
                return createBlock('dblocks/dblocks-codepro', {
                    content: content,
                    ...DEFAULT_ATTRIBUTES
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
                const content = node.textContent;
                return createBlock('dblocks/dblocks-codepro', {
                    content: content,
                    ...DEFAULT_ATTRIBUTES
                });
            },
        }
    ],
    to: [
        {
            type: 'block',
            blocks: ['core/html'],
            transform: ({ content }) => {
                return createBlock('core/html', {
                    content: content
                });
            },
        },
        {
            type: 'block',
            blocks: ['core/code'],
            transform: ({ content }) => {
                return createBlock('core/code', {
                    content: content
                });
            },
        }
    ]
};

export default transforms;
