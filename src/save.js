import { RawHTML } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { syntaxHighlight, content, theme, editorLanguage } = attributes;
    const blockProps = useBlockProps.save();

    if (syntaxHighlight) {
        // Display the code with syntax highlighting
        return (
            
                <pre {...blockProps}>
                    <code className={`language-${editorLanguage}`}>
                        {content}
                    </code>
                </pre>
        );
    } else {
        // Display content as HTML when syntaxHighlight is false
        return attributes.useWrapper ? (
            <div>
                <RawHTML>{attributes.content}</RawHTML>
            </div>
        ) : (
            <RawHTML>{attributes.content}</RawHTML>
        );
    }
}
