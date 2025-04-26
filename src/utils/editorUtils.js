/**
 * Utility functions for the code editor
 */

/**
 * Handle editor resize and update necessary state
 * 
 * @param {string|number} newHeight - The new height value
 * @param {Function} setEditorHeight - State setter for editor height
 * @param {Function} toggleAttribute - Function to update block attributes
 * @param {Object} editorContainerRef - Reference to the editor container
 * @param {Object} editorInstanceRef - Reference to the Monaco editor instance
 */
export const updateEditorSize = (newHeight, setEditorHeight, toggleAttribute, editorContainerRef, editorInstanceRef) => {
    const heightValue = typeof newHeight === 'string' && newHeight.endsWith('px')
        ? parseInt(newHeight)
        : newHeight;

    setEditorHeight(heightValue);
    toggleAttribute('editorHeight', heightValue);

    if (editorContainerRef.current) {
        editorContainerRef.current.style.height = typeof heightValue === 'number'
            ? `${heightValue}px`
            : heightValue;

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
    const normalizedValue =
        typeof value === 'string' && /^\d+$/.test(value.trim()) ? `${value.trim()}px` :
            typeof value === 'number' ? `${value}px` :
                value;

    const test = document.createElement("div");
    test.style.height = normalizedValue;
    test.style.position = "absolute";
    test.style.visibility = "hidden";
    test.style.zIndex = -9999;
    document.body.appendChild(test);
    const px = test.offsetHeight;
    document.body.removeChild(test);
    return px;
}; 