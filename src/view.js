const copyButtonLabel = "Copy";

// use a class selector if available
let blocks = document.querySelectorAll("pre");

blocks.forEach((block) => {
  // only add button if browser supports Clipboard API
  if (navigator.clipboard) {
    let button = document.createElement("button");

    button.innerText = copyButtonLabel;
    block.appendChild(button);

    button.addEventListener("click", async () => {
      await copyCode(block, button);
    });
  }
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.innerText = "Code Copied";

  setTimeout(() => {
    button.innerText = copyButtonLabel;
  }, 700);
}

document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to all copy buttons
    document.querySelectorAll('.wp-block-dblocks-dblocks-codepro .copy-button').forEach(button => {
        button.addEventListener('click', async function() {
            const codeBlock = this.parentElement.querySelector('code');
            if (!codeBlock) return;

            // Get the text content
            const text = codeBlock.textContent;

            try {
                // Try using the Clipboard API first
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback for non-HTTPS or older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                // Visual feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                // Show error feedback
                const originalText = this.textContent;
                this.textContent = 'Failed to copy';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }
        });
    });
});
