const COPY_BUTTON_LABEL = "Copy";
const COPY_SUCCESS_LABEL = "Copied!";
const COPY_ERROR_LABEL = "Failed to copy";
const FEEDBACK_DURATION = 2000;

// Monaco editor instances cache
const monacoInstances = new Map();
let monacoLoaded = false;

// Get global editor theme from WordPress settings
const getGlobalEditorTheme = async () => {
    try {
        // Try to get from WordPress REST API
        const response = await fetch('/wp-json/dblocks_codepro/v1/syntax-theme/');
        if (response.ok) {
            const theme = await response.text();
            
            // Clean the theme value and check for dark
            const cleanTheme = theme.trim().replace(/"/g, '').replace(/'/g, '');
            
            if (cleanTheme === 'dark') {
                return 'dark';
            } else {
                return 'light';
            }
        }
    } catch (error) {
        console.log('Could not fetch global theme, using default');
    }
    
    // Default to light theme
    return 'light';
};

// Get global display language setting
const getGlobalDisplayLanguage = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/display-language/');
        if (response.ok) {
            const displayLanguage = await response.text();
            
            // Handle both "true"/"false" strings and "1"/"0" strings
            const cleanValue = displayLanguage.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            return isEnabled;
        }
    } catch (error) {
        console.log('Could not fetch global display language, using default');
    }
    return true; // Default to showing language label
};

// Get global copy button setting
const getGlobalCopyButton = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/copy-button/');
        if (response.ok) {
            const copyButton = await response.text();
            
            // Handle both "true"/"false" strings and "1"/"0" strings
            const cleanValue = copyButton.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            return isEnabled;
        }
    } catch (error) {
        console.log('Could not fetch global copy button, using default');
    }
    return true; // Default to showing copy button
};

// Get global display row numbers setting
const getGlobalDisplayRowNumbers = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/display-row-numbers/');
        if (response.ok) {
            const displayRowNumbers = await response.text();
            
            const cleanValue = displayRowNumbers.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            return isEnabled;
        }
    } catch (error) {
        console.log('Could not fetch global display row numbers, using default');
    }
    return false; // Default to hiding row numbers
};

// Get global indent width setting
const getGlobalIndentWidth = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/indent-width/');
        if (response.ok) {
            const indentWidth = await response.text();
            
            const cleanValue = indentWidth.trim().replace(/"/g, '').replace(/'/g, '');
            return cleanValue || '4px';
        }
    } catch (error) {
        console.log('Could not fetch global indent width, using default');
    }
    return '4px'; // Default indent width
};

// Get global font size setting
const getGlobalFontSize = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/font-size/');
        if (response.ok) {
            const fontSize = await response.text();
            
            const cleanValue = fontSize.trim().replace(/"/g, '').replace(/'/g, '');
            return cleanValue || '14px';
        }
    } catch (error) {
        console.log('Could not fetch global font size, using default');
    }
    return '14px'; // Default font size
};

// Get global line height setting
const getGlobalLineHeight = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/line-height/');
        if (response.ok) {
            const lineHeight = await response.text();
            
            const cleanValue = lineHeight.trim().replace(/"/g, '').replace(/'/g, '');
            return cleanValue || '20px';
        }
    } catch (error) {
        console.log('Could not fetch global line height, using default');
    }
    return '20px'; // Default line height
};

// Get global letter spacing setting
const getGlobalLetterSpacing = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/letter-spacing/');
        if (response.ok) {
            const letterSpacing = await response.text();
            
            const cleanValue = letterSpacing.trim().replace(/"/g, '').replace(/'/g, '');
            return cleanValue || '0px';
        }
    } catch (error) {
        console.log('Could not fetch global letter spacing, using default');
    }
    return '0px'; // Default letter spacing
};

// Get global word wrap setting
const getGlobalWordWrap = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/word-wrap/');
        if (response.ok) {
            const wordWrap = await response.text();
            
            const cleanValue = wordWrap.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            return isEnabled;
        }
    } catch (error) {
        console.log('Could not fetch global word wrap, using default');
    }
    return false; // Default to no word wrap
};

// Extract content from block's existing HTML instead of data-content
const extractContentFromBlock = (block) => {
    // Look for existing content in the block
    // This could be in various forms depending on how the block was saved
    
    // First, try to find any existing text content
    const textContent = block.textContent || block.innerText || '';
    
    // Clean up the text content (remove extra whitespace, etc.)
    const cleanContent = textContent.trim();
    
    // If we have meaningful content, return it
    if (cleanContent && cleanContent.length > 0) {
        return cleanContent;
    }
    
    // Fallback: try to find content in any child elements
    const codeElements = block.querySelectorAll('code, pre, .wp-block-code');
    if (codeElements.length > 0) {
        return codeElements[0].textContent || '';
    }
    
    // Last resort: return empty string
    return '';
};

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



// Handle copy button click
const handleCopyClick = async (button, content, theme) => {
    try {
        // Try to use the modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(content);
        } else {
            // Fallback for non-HTTPS or older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            
            document.body.removeChild(textArea);
        }
        
        // Change button text to "Copied!"
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = theme === 'dark' ? '#2d5a2d' : '#d4edda';
        button.style.color = theme === 'dark' ? '#a8e6a8' : '#155724';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = theme === 'dark' ? '#3c3c3c' : '#f1f3f4';
            button.style.color = theme === 'dark' ? '#cccccc' : '#5f6368';
        }, 2000);
        
    } catch (err) {
        console.error('Copy failed:', err);
        // Show error feedback
        const originalText = button.textContent;
        button.textContent = 'Error!';
        button.style.background = '#f8d7da';
        button.style.color = '#721c24';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = theme === 'dark' ? '#3c3c3c' : '#f1f3f4';
            button.style.color = theme === 'dark' ? '#cccccc' : '#5f6368';
        }, 2000);
    }
};

// Load Monaco editor
const loadMonaco = async () => {
    if (monacoLoaded) return window.monaco;

    // If require already exists, skip loader injection
    if (!window.require) {
        // Check if loader.js is already in the DOM
        if (!document.querySelector('script[data-monaco-loader]')) {
            const script = document.createElement('script');
            script.src = `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs/loader.js`;
            script.setAttribute('data-monaco-loader', 'true');
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // Wait until require is available
        await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.require) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });
    }

    // Configure and load monaco only once
    if (!monacoLoaded) {
        window.require.config({
            paths: {
                vs: `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs`
            }
        });

        return new Promise((resolve, reject) => {
            window.require(['vs/editor/editor.main'], (monaco) => {
                monacoLoaded = true;
                resolve(monaco);
            }, reject);
        });
    }

    return window.monaco;
};

// Initialize Monaco editor for syntax highlighting (no loader)
const initializeMonacoEditor = async (
    container,
    content,
    language,
    theme,
    displayRowNumbers,
    indentWidth,
    fontSize,
    lineHeight,
    letterSpacing,
    wordWrap
) => {
    try {
        // Load Monaco
        const monaco = await loadMonaco();

        // Load the specific language module
        await new Promise((resolve, reject) => {
            window.require([`vs/basic-languages/${language}/${language}`], resolve, reject);
        });

        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.style.height = '100%';
        editorContainer.style.width = '100%';
        container.appendChild(editorContainer);

        // Choose theme
        const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

        // Custom font styles
        const customStyles = document.createElement('style');
        customStyles.textContent = `
            .monaco-editor .monaco-editor-background,
            .monaco-editor .inputarea {
                font-size: ${fontSize} !important;
                line-height: ${lineHeight} !important;
                letter-spacing: ${letterSpacing} !important;
            }
        `;
        container.appendChild(customStyles);

        const editor = monaco.editor.create(editorContainer, {
            value: content,
            language,
            theme: monacoTheme,
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: displayRowNumbers ? "on" : "off",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: displayRowNumbers ? 40 : 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'none',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            overviewRulerLanes: 0,
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0
            },
            contextmenu: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            wordBasedSuggestions: false,
            automaticLayout: true,
            fontSize: parseInt(fontSize),
            lineHeight: parseInt(lineHeight),
            letterSpacing: parseInt(letterSpacing),
            tabSize: parseInt(indentWidth),
            wordWrap: wordWrap ? 'on' : 'off',
            renderWhitespace: 'none',
            fixedOverflowWidgets: true,
            padding: { top: 0, bottom: 0 }
        });

        // Store instance
        const instanceId = `monaco-${Date.now()}-${Math.random()}`;
        container.dataset.instanceId = instanceId;
        monacoInstances.set(instanceId, editor);

        // Auto-resize
        const updateHeight = () => {
            const lineCount = editor.getModel().getLineCount();
            const lh = editor.getOption(monaco.editor.EditorOption.lineHeight);
            const padding = 20;
            const newHeight = Math.max(lineCount * lh + padding, 100);
            container.style.height = `${newHeight}px`;
            editor.layout();
        };

        setTimeout(updateHeight, 100);
        editor.onDidChangeModelContent(updateHeight);

    } catch (error) {
        console.error('Failed to initialize Monaco editor:', error);
        container.textContent = content; // Fallback to plain text
    }
};

// Initialize syntax highlighting for DBlocks with lazy loading
const initializeSyntaxHighlighting = () => {
    const syntaxBlocks = document.querySelectorAll('.wp-block-dblocks-dblocks-codepro');
    
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const block = entry.target;
                
                // Check if this is a syntax highlighter block
                const syntaxHighlight = block.dataset.syntaxHighlight === 'true';
                if (!syntaxHighlight) return; // Skip Advanced Custom HTML blocks

                // Check if Monaco is already initialized for this block
                if (block.dataset.monacoInitialized === 'true') return;

                // Mark as initialized to prevent double initialization
                block.dataset.monacoInitialized = 'true';

                // Process block asynchronously
                processBlockAsync(block);
            }
        });
    }, {
        rootMargin: '50px', // Start loading when block is 50px away from viewport
        threshold: 0.1 // Trigger when 10% of the block is visible
    });

    // Async function to process blocks
    const processBlockAsync = async (block) => {
        try {
            // Get block data
            const language = block.dataset.editorLanguage || 'html';
            let theme = block.dataset.syntaxTheme || 'light';
            
            // Always use global settings for consistency
            theme = await getGlobalEditorTheme();
            const displayLanguage = await getGlobalDisplayLanguage();
            const copyButton = await getGlobalCopyButton();
            const displayRowNumbers = await getGlobalDisplayRowNumbers();
            const indentWidth = await getGlobalIndentWidth();
            const fontSize = await getGlobalFontSize();
            const lineHeight = await getGlobalLineHeight();
            const letterSpacing = await getGlobalLetterSpacing();
            const wordWrap = await getGlobalWordWrap();
            
            // Extract content from existing block HTML instead of data-content
            const content = extractContentFromBlock(block);
            

            // Create Monaco container
            const monacoContainer = document.createElement('div');
            monacoContainer.className = 'monaco-editor-container';
            monacoContainer.style.cssText = `
                position: relative;
                overflow: hidden;
                background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
                border: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e1e5e9'};
            `;

                                    // Add language label and copy button if enabled
        if (displayLanguage || copyButton) {
            const rightSideContainer = document.createElement('div');
            rightSideContainer.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 8px;
                align-items: center;
                z-index: 10;
            `;

            // Add copy button first (left side of right container)
            if (copyButton) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-button';
                copyBtn.textContent = COPY_BUTTON_LABEL;
                copyBtn.style.cssText = `
                    background: ${theme === 'dark' ? '#3c3c3c' : '#f1f3f4'};
                    color: ${theme === 'dark' ? '#cccccc' : '#5f6368'};
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    transition: all 0.2s ease;
                `;
                
                // Hover effects
                copyBtn.addEventListener('mouseenter', () => {
                    copyBtn.style.background = theme === 'dark' ? '#4c4c4c' : '#e8eaed';
                });
                copyBtn.addEventListener('mouseleave', () => {
                    copyBtn.style.background = theme === 'dark' ? '#3c3c3c' : '#f1f3f4';
                });

                copyBtn.addEventListener('click', () => handleCopyClick(copyBtn, content, theme));
                rightSideContainer.appendChild(copyBtn);
            }

                    // Add language label second (right side of right container)
                    if (displayLanguage) {
                        const languageLabel = document.createElement('div');
                        languageLabel.className = 'language-label';
                        languageLabel.textContent = language.toUpperCase();
                        languageLabel.style.cssText = `
                            background: ${theme === 'dark' ? '#3c3c3c' : '#f1f3f4'};
                            color: ${theme === 'dark' ? '#cccccc' : '#5f6368'};
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 500;
                            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                        `;
                        rightSideContainer.appendChild(languageLabel);
                    }

                    monacoContainer.appendChild(rightSideContainer);
                }

            // Replace block content with Monaco container
            block.innerHTML = '';
            block.appendChild(monacoContainer);

            // Initialize Monaco editor
            initializeMonacoEditor(monacoContainer, content, language, theme, displayRowNumbers, indentWidth, fontSize, lineHeight, letterSpacing, wordWrap);
        } catch (error) {
            console.error('Failed to process block:', error);
            // Reset initialization flag on error
            block.dataset.monacoInitialized = 'false';
        }
    };

    // Observe all syntax highlighting blocks
    syntaxBlocks.forEach((block) => {
        const syntaxHighlight = block.dataset.syntaxHighlight === 'true';
        if (syntaxHighlight) {
            observer.observe(block);
        }
    });
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSyntaxHighlighting();
});

// Initialize copy buttons for legacy blocks (if any)
const initializeLegacyCopyButtons = () => {
    if (!navigator.clipboard) return;

    document.querySelectorAll("pre").forEach((block) => {
        if (block.closest('.wp-block-dblocks-dblocks-codepro')) return; // Skip DBlocks blocks
        
        const button = document.createElement("button");
        button.innerText = COPY_BUTTON_LABEL;
        block.appendChild(button);
        button.addEventListener("click", () => handleCopyClick(button));
    });
};

// Initialize legacy copy buttons
document.addEventListener('DOMContentLoaded', initializeLegacyCopyButtons);
