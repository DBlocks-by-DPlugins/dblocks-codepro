export function getVariationType({ syntaxHighlight, viewMode, scaleHeightWithContent }) {    
    // Determine variation based on intrinsic attributes, not current viewMode
    if (syntaxHighlight === true && scaleHeightWithContent === true) {
        return 'syntax-highlighter';
    }
    
    return 'advanced-custom-html';
}

export const VARIATION_TYPES = {
    ADVANCED_CUSTOM_HTML: 'advanced-custom-html',
    SYNTAX_HIGHLIGHTER: 'syntax-highlighter'
};