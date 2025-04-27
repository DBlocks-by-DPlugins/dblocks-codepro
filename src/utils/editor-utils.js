/**
 * Editor utility functions for handling dimensions and sizing
 */

/**
 * Parses any height value to ensure it's a valid pixel value
 * 
 * @param {string|number} value - Input height value
 * @param {number} defaultHeight - Default height to use if parsing fails
 * @param {number} minHeight - Minimum height to enforce
 * @returns {number} - Parsed height value in pixels (without 'px' suffix)
 */
export const parseHeightValue = (value, defaultHeight = 500, minHeight = 10) => {
    // Handle numbers directly
    if (typeof value === 'number') return Math.max(minHeight, value);
    
    // Handle string values
    if (typeof value === 'string') {
        // Extract numeric portion whether 'px' is included or not
        const numericValue = parseInt(value, 10);
        return isNaN(numericValue) ? defaultHeight : Math.max(minHeight, numericValue);
    }
    
    // Default fallback
    return defaultHeight;
};

/**
 * Formats a height value to include 'px' suffix
 * 
 * @param {string|number} value - Input height value
 * @returns {string} - Formatted height with 'px' suffix
 */
export const formatHeightWithPx = (value) => {
    const numericValue = parseHeightValue(value);
    return `${numericValue}px`;
};

/**
 * Simplified pixel conversion function - optimized for performance
 * 
 * @param {string|number} value - Input value to convert to pixels
 * @returns {number} - Numeric pixel value
 */
export const convertToPx = (value) => {
    return parseHeightValue(value);
}; 