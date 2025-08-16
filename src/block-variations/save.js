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
    // Create new blockProps with data attributes for Monaco editor
    const newBlockProps = {
        ...blockProps,
        className: 'wp-block-dblocks-dblocks-codepro',
        'data-syntax-highlight': 'true',
        'data-content': content,
        'data-editor-language': editorLanguage,
        'data-syntax-theme': syntaxThemeClass === 'syntax-light' ? 'light' : 'dark',
        'data-display-language': displayLanguage ? 'true' : 'false',
        'data-copy-button': copyButton ? 'true' : 'false'
    };

    return (
        <div {...newBlockProps}>
            {/* Monaco editor will be initialized here by frontend JavaScript */}
        </div>
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
