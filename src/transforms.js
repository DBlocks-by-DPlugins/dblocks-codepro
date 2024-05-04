import { createBlock } from '@wordpress/blocks';

const transforms = {
    from: [
        {
            type: 'block',
            blocks: ['core/html', 'core/code'],
            transform: ({ content }) => {
                return createBlock('dblocks/dblocks-codepro', {
                    content: content,
                    viewMode: 'code',
                    theme: 'vs-light',
                    syntaxHighlight: true,
                    syntaxHighlightTheme: 'light',
                    editorLanguage: 'html'
                });
            },
        },
    ],
};

export default transforms;
