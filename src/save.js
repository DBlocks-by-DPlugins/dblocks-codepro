import { RawHTML } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

// Language mapping
const languageLabels = {
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    js: 'JavaScript',
    php: 'PHP',
    typescript: 'TypeScript',
    bash: 'Bash',
    twig: 'Twig',
    yaml: 'YAML',
    plaintext: 'Plaintext',
    json: 'JSON'
};

// Get display name for a language
const getLanguageLabel = (langValue) => {
    return languageLabels[langValue] || langValue;
};

export default function save({ attributes }) {
    const { syntaxHighlight, content, theme, syntaxHighlightTheme, editorLanguage } = attributes;
    const blockProps = useBlockProps.save();
    const syntaxThemeClass = syntaxHighlightTheme === 'light' ? 'hsl-light' : '';
    
    // Safely check if displayLanguage is enabled (handle backwards compatibility)
    const shouldDisplayLanguage = attributes.displayLanguage === true;

    if (syntaxHighlight) {
        // Display the code with syntax highlighting
        return (
            <div {...blockProps} className={`${blockProps.className || ''} syntax-highlighted-container`}>
                {shouldDisplayLanguage && (
                    <div className={`language-label syntax-${syntaxHighlightTheme}`}>
                        {getLanguageLabel(editorLanguage)}
                    </div>
                )}
                <pre>
                    <code className={`language-${editorLanguage} ${syntaxThemeClass}`}>
                        {content}
                    </code>
                </pre>
            </div>
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
