import { createBlock } from '@wordpress/blocks';

const DEFAULT_ATTRIBUTES = {
    viewMode: 'code',
    theme: 'vs-light',
    syntaxHighlight: true,
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
                    content,
                    ...DEFAULT_ATTRIBUTES
                });
            },
        },
    ],
};

export default transforms;
