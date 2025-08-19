/**
 * Frontend JavaScript for DBlocks Code Pro 2
 * Handles highlight.js initialization and copy button functionality for syntax highlighted code blocks
 */

(function() {
    'use strict';

    /**
     * Initialize highlight.js for all code blocks
     */
    function initHighlightJS() {
        console.log('DBlocks: Initializing highlight.js');
        
        if (typeof hljs !== 'undefined') {
            // Find all code blocks that need highlighting
            const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
            console.log('DBlocks: Found code blocks:', codeBlocks.length);
            
            if (codeBlocks.length > 0) {
                // Highlight all code blocks
                hljs.highlightAll();
                console.log('DBlocks: Highlight.js applied to all code blocks');
                
                // Add click functionality to existing header copy buttons
                const headerCopyButtons = document.querySelectorAll('.syntax-highlighter-header .copy-code-button');
                headerCopyButtons.forEach(button => {
                    addCopyButtonFunctionality(button);
                });
            }
        } else {
            console.log('DBlocks: Highlight.js not available');
        }
    }

    /**
     * Add copy button functionality to existing header copy buttons
     */
    function addCopyButtonFunctionality(copyButton) {
        // Check if functionality already added
        if (copyButton.hasAttribute('data-functionality-added')) {
            return;
        }

        console.log('DBlocks: Adding functionality to header copy button');

        // Add click functionality
        copyButton.addEventListener('click', async (event) => {
            console.log('DBlocks: Header copy button clicked!');
            event.preventDefault();
            event.stopPropagation();
            
            try {
                // Get the code content from data attribute
                const codeContent = copyButton.getAttribute('data-code-content');
                if (!codeContent) {
                    console.error('DBlocks: No code content found in data attribute');
                    return;
                }
                
                // Try modern clipboard API first (HTTPS only)
                if (navigator.clipboard && window.isSecureContext) {
                    console.log('DBlocks: Using modern clipboard API');
                    await navigator.clipboard.writeText(codeContent);
                } else {
                    // Fallback for HTTP or when clipboard API is not available
                    console.log('DBlocks: Using fallback copy method');
                    fallbackCopyTextToClipboard(codeContent);
                }
                
                // Show success feedback regardless of method used
                console.log('DBlocks: Copy successful, changing text to Copied!');
                const textSpan = copyButton.querySelector('.copy-code-button-text');
                if (textSpan) {
                    textSpan.textContent = 'Copied!';
                    setTimeout(() => {
                        textSpan.textContent = 'Copy';
                        console.log('DBlocks: Text reverted to Copy');
                    }, 2000);
                } else {
                    // Fallback to changing button text if span not found
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        console.log('DBlocks: Text reverted to Copy');
                    }, 2000);
                }
                
            } catch (err) {
                console.error('DBlocks: Failed to copy code:', err);
                const textSpan = copyButton.querySelector('.copy-code-button-text');
                if (textSpan) {
                    textSpan.textContent = 'Failed';
                    setTimeout(() => {
                        textSpan.textContent = 'Copy';
                    }, 2000);
                } else {
                    // Fallback to changing button text if span not found
                    copyButton.textContent = 'Failed';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                }
            }
        });

        // Mark as having functionality added
        copyButton.setAttribute('data-functionality-added', 'true');
    }

    /**
     * Fallback copy method for HTTP or when clipboard API is not available
     */
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                console.warn('Fallback copy command failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        // Initialize immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHighlightJS);
        } else {
            initHighlightJS();
        }

        // Also initialize for dynamically loaded content (e.g., AJAX, infinite scroll)
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                let shouldHighlight = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.querySelector && node.querySelector('pre code[class*="language-"]')) {
                                    shouldHighlight = true;
                                }
                            }
                        });
                    }
                });

                if (shouldHighlight) {
                    // Small delay to ensure content is fully rendered
                    setTimeout(initHighlightJS, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Start initialization
    init();

})();
