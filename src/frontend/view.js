const COPY_BUTTON_LABEL = "Copy";
const COPY_SUCCESS_LABEL = "Copied!";
const COPY_ERROR_LABEL = "Failed to copy";
const FEEDBACK_DURATION = 2000;

// Monaco editor instances cache
const monacoInstances = new Map();
let monacoLoaded = false;

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
    const codeBlock = button.closest('.monaco-editor-container')?.querySelector('.monaco-editor');
    if (!codeBlock) return;

    // Get text from Monaco editor
    const editorInstance = monacoInstances.get(codeBlock.dataset.instanceId);
    if (editorInstance) {
        const text = editorInstance.getValue();
        const success = await copyToClipboard(text);
        updateButtonText(
            button,
            success ? COPY_SUCCESS_LABEL : COPY_ERROR_LABEL,
            FEEDBACK_DURATION
        );
    }
};

// Load Monaco editor
const loadMonaco = async () => {
    if (monacoLoaded) return window.monaco;
    
    try {
        // Load Monaco loader
        const script = document.createElement('script');
        script.src = `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs/loader.js`;
        
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        // Wait for require to be available
        await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.require) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });

        // Configure Monaco loader
        window.require.config({
            paths: {
                'vs': `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs`
            }
        });

        // Load Monaco editor
        return new Promise((resolve, reject) => {
            window.require(['vs/editor/editor.main'], (monaco) => {
                monacoLoaded = true;
                resolve(monaco);
            }, reject);
        });
    } catch (error) {
        console.error('Failed to load Monaco:', error);
        throw error;
    }
};

// Initialize Monaco editor for syntax highlighting
const initializeMonacoEditor = async (container, content, language, theme) => {
    try {
        // Show loading state
        const loadingElement = document.createElement('div');
        loadingElement.className = 'monaco-loading';
        loadingElement.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: ${theme === 'dark' ? '#cccccc' : '#5f6368'};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            ">
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                ">
                    <div style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid ${theme === 'dark' ? '#3c3c3c' : '#e1e5e9'};
                        border-top: 2px solid ${theme === 'dark' ? '#007acc' : '#007cba'};
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <span>Loading ${language} syntax highlighting...</span>
                </div>
            </div>
        `;
        
        // Add CSS animation for spinner
        if (!document.querySelector('#monaco-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'monaco-loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(loadingElement);

        // Load Monaco
        const monaco = await loadMonaco();
        
        // Load the specific language module
        await new Promise((resolve, reject) => {
            window.require([`vs/basic-languages/${language}/${language}`], resolve, reject);
        });

        // Remove loading element
        loadingElement.remove();
        
        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.style.height = '100%';
        editorContainer.style.width = '100%';
        container.appendChild(editorContainer);

        // Create Monaco editor with stripped UI
        const editor = monaco.editor.create(editorContainer, {
            value: content,
            language: language,
            theme: theme === 'dark' ? 'vs-dark' : 'vs',
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
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
            automaticLayout: true
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
                if (!syntaxHighlight) return; // Skip code executor blocks

                // Check if Monaco is already initialized for this block
                if (block.dataset.monacoInitialized === 'true') return;

                // Get block data
                const content = block.dataset.content || '';
                const language = block.dataset.editorLanguage || 'html';
                const theme = block.dataset.syntaxTheme || 'light';
                const displayLanguage = block.dataset.displayLanguage === 'true';
                const copyButton = block.dataset.copyButton === 'true';

                // Create Monaco container
                const monacoContainer = document.createElement('div');
                monacoContainer.className = 'monaco-editor-container';
                monacoContainer.style.cssText = `
                    position: relative;
                    border-radius: 6px;
                    overflow: hidden;
                    background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
                    border: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e1e5e9'};
                `;

                // Add language label if enabled
                if (displayLanguage) {
                    const languageLabel = document.createElement('div');
                    languageLabel.className = 'language-label';
                    languageLabel.textContent = language.toUpperCase();
                    languageLabel.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: ${theme === 'dark' ? '#3c3c3c' : '#f1f3f4'};
                        color: ${theme === 'dark' ? '#cccccc' : '#5f6368'};
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 500;
                        z-index: 10;
                        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                    `;
                    monacoContainer.appendChild(languageLabel);
                }

                // Add copy button if enabled
                if (copyButton) {
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'copy-button';
                    copyBtn.textContent = COPY_BUTTON_LABEL;
                    copyBtn.style.cssText = `
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        background: ${theme === 'dark' ? '#3c3c3c' : '#f1f3f4'};
                        color: ${theme === 'dark' ? '#cccccc' : '#5f6368'};
                        border: none;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                        z-index: 10;
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

                    copyBtn.addEventListener('click', () => handleCopyClick(copyBtn));
                    monacoContainer.appendChild(copyBtn);
                }

                // Replace block content with Monaco container
                block.innerHTML = '';
                block.appendChild(monacoContainer);

                // Mark as initialized to prevent double initialization
                block.dataset.monacoInitialized = 'true';

                // Initialize Monaco editor
                initializeMonacoEditor(monacoContainer, content, language, theme);
            }
        });
    }, {
        rootMargin: '50px', // Start loading when block is 50px away from viewport
        threshold: 0.1 // Trigger when 10% of the block is visible
    });

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
