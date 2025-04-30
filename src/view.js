const COPY_BUTTON_LABEL = "Copy";
const COPY_SUCCESS_LABEL = "Copied!";
const COPY_ERROR_LABEL = "Failed to copy";
const FEEDBACK_DURATION = 2000;

const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
};

const updateButtonText = (button, text, duration) => {
    const originalText = button.textContent;
    button.textContent = text;
    setTimeout(() => {
        button.textContent = originalText;
    }, duration);
};

const handleCopyClick = async (button) => {
    const codeBlock = button.closest('pre')?.querySelector('code');
    if (!codeBlock) return;

    const success = await copyToClipboard(codeBlock.textContent);
    updateButtonText(
        button,
        success ? COPY_SUCCESS_LABEL : COPY_ERROR_LABEL,
        FEEDBACK_DURATION
    );
};

// Initialize copy buttons
const initializeCopyButtons = () => {
    document.querySelectorAll('.wp-block-dblocks-dblocks-codepro .copy-button').forEach(button => {
        button.addEventListener('click', () => handleCopyClick(button));
    });
};

// Initialize legacy copy buttons
const initializeLegacyCopyButtons = () => {
    if (!navigator.clipboard) return;

    document.querySelectorAll("pre").forEach((block) => {
        const button = document.createElement("button");
        button.innerText = COPY_BUTTON_LABEL;
        block.appendChild(button);
        button.addEventListener("click", () => handleCopyClick(button));
    });
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCopyButtons();
    initializeLegacyCopyButtons();
});
