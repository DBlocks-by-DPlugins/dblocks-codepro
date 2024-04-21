import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { syntaxHighlight, content, theme, editorLanguage } = attributes;
    const blockProps = useBlockProps.save();

    if (syntaxHighlight) {
        // Display the code with syntax highlighting
        return (
            <div {...blockProps}>
                <pre>
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
