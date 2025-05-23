import { RawHTML } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

const CodeDisplay = ({ content, editorLanguage, syntaxThemeClass, displayLanguage, copyButton }) => (
    <div className='tag-wrapper'>
        {copyButton && (
            <button className="copy-button tag-button">
                Copy
            </button>
        )}
        {displayLanguage && (
            <div className="code-language-label tag-button">
                {editorLanguage.toUpperCase()}
            </div>
        )}
    </div>
);

const SyntaxHighlightedCode = ({ blockProps, content, editorLanguage, syntaxThemeClass, displayLanguage, copyButton }) => {
    // Create new blockProps with the theme class
    const newBlockProps = {
        ...blockProps,
        className: `wp-block-dblocks-dblocks-codepro ${syntaxThemeClass} syntax-highlighted-container`
    };

    return (
        <pre {...newBlockProps}>
            <CodeDisplay 
                content={content}
                editorLanguage={editorLanguage}
                syntaxThemeClass={syntaxThemeClass}
                displayLanguage={displayLanguage}
                copyButton={copyButton}
            />
            <code className={`language-${editorLanguage}`}>
                {content}
            </code>
        </pre>
    );
};

const RawHTMLDisplay = ({ blockProps, content, useWrapper }) => {
    const contentElement = <RawHTML>{content}</RawHTML>;
    return useWrapper ? <div {...blockProps}>{contentElement}</div> : contentElement;
};

export default function save({ attributes }) {
    const { 
        syntaxHighlight, 
        content, 
        theme, 
        syntaxHighlightTheme, 
        editorLanguage, 
        displayLanguage, 
        copyButton,
        useWrapper 
    } = attributes;
    
    const blockProps = useBlockProps.save();
    const syntaxThemeClass = syntaxHighlightTheme === 'light' ? 'syntax-light' : 'syntax-dark';

    if (syntaxHighlight) {
        return (
            <SyntaxHighlightedCode
                blockProps={blockProps}
                content={content}
                editorLanguage={editorLanguage}
                syntaxThemeClass={syntaxThemeClass}
                displayLanguage={displayLanguage}
                copyButton={copyButton}
            />
        );
    }

    return (
        <RawHTMLDisplay
            blockProps={blockProps}
            content={content}
            useWrapper={useWrapper}
        />
    );
}
