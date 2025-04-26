/**
 * Utility functions for the code editor
 */

/**
 * Handle editor resize and update necessary state
 * 
 * @param {string|number} newHeight - The new height value (in px)
 * @param {Function} setEditorHeight - State setter for editor height
 * @param {Function} toggleAttribute - Function to update block attributes
 * @param {Object} editorContainerRef - Reference to the editor container
 * @param {Object} editorInstanceRef - Reference to the Monaco editor instance
 */
export const updateEditorSize = (newHeight, setEditorHeight, toggleAttribute, editorContainerRef, editorInstanceRef) => {
    // Convert to number if it's a string with 'px'
    const heightValue = typeof newHeight === 'string' && newHeight.endsWith('px')
        ? parseInt(newHeight)
        : (typeof newHeight === 'number' ? newHeight : parseInt(newHeight));

    // Ensure we always work with a number
    const heightInPixels = isNaN(heightValue) ? 500 : heightValue;

    // Update state with the pixel value
    setEditorHeight(`${heightInPixels}px`);
    toggleAttribute('editorHeight', `${heightInPixels}px`);

    // Update DOM if refs are available
    if (editorContainerRef.current) {
        editorContainerRef.current.style.height = `${heightInPixels}px`;
        
        if (editorInstanceRef.current) {
            editorInstanceRef.current.layout();
        }
    }
};

/**
 * Convert any CSS unit to pixels
 * 
 * @param {string|number} value - Value with CSS unit or number
 * @returns {number} - Value in pixels
 */
export const convertToPx = (value) => {
    // If it's already a number, return it
    if (typeof value === 'number') {
        return value;
    }
    
    // If it's a string with px, parse it
    if (typeof value === 'string' && value.endsWith('px')) {
        return parseInt(value);
    }
    
    // If it's a string without units, convert to px
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
        return parseInt(value.trim());
    }
    
    // Default fallback for any other types of input
    return 500;
}; 