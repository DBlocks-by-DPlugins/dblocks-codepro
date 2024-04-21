import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { syntaxHighlight, content, theme, editorLanguage } = attributes;
    const blockProps = useBlockProps.save();

    if (syntaxHighlight) {
        // Display the code with syntax highlighting
        return (
            <div {...blockProps}>
                <pre style={{ overflowX: 'auto', backgroundColor: '#1e1e1e', color: theme === 'vs-dark' ? '#d4d4d4' : '#333', padding: '20px', borderRadius: '5px', fontFamily: '"Courier New", Courier, monospace' }}>
                    <code className={`language-${editorLanguage}`}>
                        {content}
                    </code>
                </pre>
            </div>
        );
    } else {
        // Display content as HTML when syntaxHighlight is false
        return (
            <div {...blockProps} dangerouslySetInnerHTML={{ __html: content }} />
        );
    }
}
