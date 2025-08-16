const COPY_BUTTON_LABEL = "Copy";
const COPY_SUCCESS_LABEL = "Copied!";
const COPY_ERROR_LABEL = "Failed to copy";
const FEEDBACK_DURATION = 2000;

// Monaco editor instances cache
const monacoInstances = new Map();

// Import shared Monaco loader to prevent duplicate loading
import { loadMonaco } from '../utils/monaco-loader.js';

// Get global editor theme from WordPress settings
const getGlobalEditorTheme = async () => {
    try {
        // Try to get from WordPress REST API
        const response = await fetch('/wp-json/dblocks_codepro/v1/syntax-theme/');
        if (response.ok) {
            const theme = await response.text();
            console.log('Frontend: Fetched global theme:', theme, 'Type:', typeof theme, 'Length:', theme.length);
            
            // Clean the theme value and check for dark
            const cleanTheme = theme.trim().replace(/"/g, '').replace(/'/g, '');
            console.log('Frontend: Cleaned theme:', cleanTheme);
            
            if (cleanTheme === 'dark') {
                console.log('Frontend: Returning dark theme');
                return 'dark';
            } else {
                console.log('Frontend: Returning light theme (not dark)');
                return 'light';
            }
        }
    } catch (error) {
        console.log('Could not fetch global theme, using default');
    }
    
    // Default to light theme
    console.log('Frontend: Using default light theme');
    return 'light';
};

// Get global display language setting
const getGlobalDisplayLanguage = async () => {
    try {
        const response = await fetch('/wp-json/dblocks_codepro/v1/display-language/');
        if (response.ok) {
            const displayLanguage = await response.text();
            console.log('Frontend: Fetched global display language:', displayLanguage);
            
            // Handle both "true"/"false" strings and "1"/"0" strings
            const cleanValue = displayLanguage.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            console.log('Frontend: Display language enabled:', isEnabled);
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
            console.log('Frontend: Fetched global copy button:', copyButton);
            
            // Handle both "true"/"false" strings and "1"/"0" strings
            const cleanValue = copyButton.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            console.log('Frontend: Copy button enabled:', isEnabled);
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
            console.log('Frontend: Fetched global display row numbers:', displayRowNumbers);
            
            const cleanValue = displayRowNumbers.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            console.log('Frontend: Display row numbers enabled:', isEnabled);
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
            console.log('Frontend: Fetched global indent width:', indentWidth);
            
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
            console.log('Frontend: Fetched global font size:', fontSize);
            
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
            console.log('Frontend: Fetched global line height:', lineHeight);
            
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
            console.log('Frontend: Fetched global letter spacing:', letterSpacing);
            
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
            console.log('Frontend: Fetched global word wrap:', wordWrap);
            
            const cleanValue = wordWrap.trim().replace(/"/g, '').replace(/'/g, '');
            const isEnabled = cleanValue === 'true' || cleanValue === '1';
            console.log('Frontend: Word wrap enabled:', isEnabled);
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

// Monaco loading is now handled by the shared loader

// Initialize Monaco editor for syntax highlighting - No loading states
const initializeMonacoEditor = async (container, content, language, theme, displayRowNumbers, indentWidth, fontSize, lineHeight, letterSpacing, wordWrap) => {
    try {
        // Load Monaco directly
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

        // Create Monaco editor with stripped UI - use same theme logic as editor
        const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
        console.log('Frontend: Creating Monaco editor with theme:', monacoTheme, '(fetched theme:', theme, ')');
        
        // Apply custom CSS for font size, line height, and letter spacing
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
            language: language,
            theme: monacoTheme,
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: displayRowNumbers ? "on" : "off",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
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
            // Line number and margin control
            lineNumbersMinChars: 3,
            lineDecorationsWidth: displayRowNumbers ? 40 : 0,
            minimap: { enabled: false },
            // Content width control
            fixedOverflowWidgets: true,
            // Margin and padding control
            renderWhitespace: 'none',
            // Ensure proper spacing
            padding: { top: 0, bottom: 0 }
        });

        // Store instance for copy functionality
        const instanceId = `monaco-${Date.now()}-${Math.random()}`;
        container.dataset.instanceId = instanceId;
        monacoInstances.set(instanceId, editor);

        // Auto-resize based on content
        const updateHeight = () => {
            const lineCount = editor.getModel().getLineCount();
            const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
            const padding = 20; // Small padding
            const newHeight = Math.max(lineCount * lineHeight + padding, 100);
            container.style.height = `${newHeight}px`;
            editor.layout();
        };

        // Update height after content is set
        setTimeout(updateHeight, 100);

        // Listen for content changes
        editor.onDidChangeModelContent(updateHeight);
        
    } catch (error) {
        console.error('Failed to initialize Monaco editor:', error);
        // Remove loading element and show fallback
        const loadingElement = container.querySelector('.monaco-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        // Fallback to plain text if Monaco fails
        container.textContent = content;
    }
};

// Initialize syntax highlighting for DBlocks - No lazy loading
const initializeSyntaxHighlighting = () => {
    const syntaxBlocks = document.querySelectorAll('.wp-block-dblocks-dblocks-codepro');
    
        // Process all syntax highlighting blocks immediately
    syntaxBlocks.forEach((block) => {
        const syntaxHighlight = block.dataset.syntaxHighlight === 'true';
        if (syntaxHighlight) {
            // Process block immediately
            processBlock(block);
        }
    });
};

// Function to process a single block
const processBlock = async (block) => {
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
        
        console.log('Frontend: Using global settings - Theme:', theme, 'Display Language:', displayLanguage, 'Copy Button:', copyButton);
        console.log('Frontend: Using theme for Monaco:', theme);
        console.log('Frontend: Extracted content length:', content.length);

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
    }
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
