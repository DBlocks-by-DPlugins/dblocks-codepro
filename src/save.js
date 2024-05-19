import { RawHTML } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { syntaxHighlight, content, theme, syntaxHighlightTheme, editorLanguage } = attributes;
    const blockProps = useBlockProps.save();
    const syntaxThemeClass = syntaxHighlightTheme === 'light' ? 'hsl-light' : '';

    if (syntaxHighlight) {
        // Display the code with syntax highlighting
        return (
            <pre {...blockProps}>
                <code className={`language-${editorLanguage} ${syntaxThemeClass}`}>
                    {content}
                </code>
            </pre>
        );
    } else {
        // Display content as HTML when syntaxHighlight is false
        return attributes.useWrapper ? (
            <div {...blockProps}>
                <RawHTML>{attributes.content}</RawHTML>
            </div>
        ) : (
            <RawHTML>{attributes.content}</RawHTML>
        );
    }
}
