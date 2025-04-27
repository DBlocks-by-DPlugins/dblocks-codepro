/**
 * Code Pro block frontend script.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle copy buttons
    const copyButtons = document.querySelectorAll('.copy-button');
    
    // Fallback function to copy text to clipboard
    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Make the textarea out of viewport
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        let successful = false;
        try {
            successful = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
        }
        
        document.body.removeChild(textArea);
        
        // Update button state
        if (successful) {
            button.setAttribute('data-copy-state', 'copied');
            button.textContent = 'Copied!';
            
            setTimeout(() => {
                button.setAttribute('data-copy-state', 'copy');
                button.textContent = 'Copy';
            }, 3000);
        }
    }
    
    // Function to copy text to clipboard with fallback
    function copyTextToClipboard(text, button) {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text, button);
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                // Update button text and state
                button.setAttribute('data-copy-state', 'copied');
                button.textContent = 'Copied!';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    button.setAttribute('data-copy-state', 'copy');
                    button.textContent = 'Copy';
                }, 3000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                // Try fallback if Clipboard API fails
                fallbackCopyTextToClipboard(text, button);
            });
    }
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the code element
            const codeElement = this.closest('.syntax-highlighted-container').querySelector('code');
            if (codeElement) {
                const code = codeElement.textContent;
                copyTextToClipboard(code, this);
            } else {
                console.error('Could not find code element');
            }
        });
    });
});
