/**
 * DBlocks Code Pro Admin Monaco Editor
 * HTML-only editor for block content - loads on demand
 */

(function() {
    'use strict';
    
    let currentBlockId = null;
    let monacoEditor = null;
    let monacoInstance = null;
    
    // Initialize Monaco Editor
    async function initMonaco() {
        const container = document.getElementById("monaco-editor-container");
        const placeholder = document.getElementById("monaco-placeholder");
        const skeleton = document.querySelector(".interface-interface-skeleton");
        
        if (!container) return;
        
        // Set up block content connection (without loading Monaco yet)
        setupBlockContentConnection();
        
        console.log("Monaco container ready - will load on first block click");
    }
    
    // Load Monaco editor on demand
    async function loadMonacoEditor() {
        if (monacoInstance) return monacoInstance; // Already loaded
        
        try {
            // Show the Monaco placeholder and set height
            const placeholder = document.getElementById("monaco-placeholder");
            if (placeholder) {
                placeholder.style.display = "block";
                // Update the CSS root variable for proper transitions
                document.documentElement.style.setProperty('--monaco-editor-height', '300px');
            }
            
            // Load Monaco using the existing configuration
            if (typeof window.loadMonacoForBlock === "function") {
                const monaco = await window.loadMonacoForBlock(
                    window.DBlocksCodePro?.pluginPath || '',
                    window,
                    document
                );
                
                const container = document.getElementById("monaco-editor-container");
                
                // Get Monaco options using existing utility (HTML only)
                const options = window.DBlocksSettings?.getMonacoOptions({
                    value: `<!-- Loading block content... -->`,
                    language: "html"
                }) || {};
                
                // Create editor instance
                monacoEditor = monaco.editor.create(container, options);
                monacoInstance = monaco;
                
                // Store reference globally
                window.monacoEditor = monacoEditor;
                
                // Handle window resize
                const resizeHandler = function() {
                    if (monacoEditor) {
                        monacoEditor.layout();
                    }
                };
                window.addEventListener("resize", resizeHandler);
                
                // Store the resize handler for cleanup
                monacoEditor._resizeHandler = resizeHandler;
                
                // Set up content change listener to sync back to blocks
                setupContentSync();
                
                console.log("Monaco Editor loaded on demand");
                return monaco;
            } else {
                console.error("Monaco loading function not available");
                return null;
            }
        } catch (error) {
            console.error("Failed to load Monaco Editor:", error);
            return null;
        }
    }
    
    // Destroy Monaco editor
    function destroyMonacoEditor() {
        if (monacoEditor) {
            // Remove the resize listener if it exists
            if (monacoEditor._resizeHandler) {
                window.removeEventListener("resize", monacoEditor._resizeHandler);
                monacoEditor._resizeHandler = null;
            }
            
            // Dispose the editor
            monacoEditor.dispose();
            monacoEditor = null;
        }
        if (monacoInstance) {
            monacoInstance = null;
        }
        window.monacoEditor = null;
        
        // Clear the container
        const container = document.getElementById("monaco-editor-container");
        if (container) {
            container.innerHTML = '';
        }
        
        console.log("Monaco Editor destroyed");
    }
    
    // Set up connection between blocks and Monaco editor
    function setupBlockContentConnection() {
        // Listen for clicks on blocks
        document.addEventListener('click', function(event) {
            const blockElement = event.target.closest('[data-block]');
            
            if (blockElement) {
                // Clicked on a block
                loadBlockContent(blockElement);
            } else {
                // Check if we clicked on Monaco editor itself
                const monacoContainer = event.target.closest('#monaco-placeholder');
                if (!monacoContainer) {
                    // Clicked outside both blocks and Monaco - clear content
                    clearBlockContent();
                }
            }
        });
        
        // Also listen for block selection changes in Gutenberg
        if (window.wp && window.wp.data) {
            try {
                const unsubscribe = window.wp.data.subscribe(() => {
                    const selectedBlock = window.wp.data.select('core/block-editor').getSelectedBlock();
                    if (selectedBlock) {
                        // Update content when block selection changes
                        updateBlockContentFromSelection(selectedBlock);
                    } else {
                        // No block selected - clear content
                        clearBlockContent();
                    }
                });
                
                // Clean up subscription when page unloads
                window.addEventListener('beforeunload', unsubscribe);
            } catch (error) {
                console.log('Gutenberg data API not available, using click detection only');
            }
        }
        
        // Listen for clicks on document to handle clicking outside
        document.addEventListener('click', function(event) {
            // If Monaco is loaded and we clicked outside both blocks and Monaco
            if (monacoEditor && currentBlockId) {
                const blockElement = event.target.closest('[data-block]');
                const monacoElement = event.target.closest('#monaco-placeholder');
                
                if (!blockElement && !monacoElement) {
                    // Clicked outside both - clear content
                    clearBlockContent();
                }
            }
        });
    }
    
    // Load content from a specific block
    async function loadBlockContent(blockElement) {
        const blockId = blockElement.getAttribute('data-block');
        
        // If clicking on the same block, do nothing
        if (blockId === currentBlockId) return;
        
        // Check if this block should load Monaco (Advanced Custom HTML + split viewMode)
        const shouldLoad = shouldLoadMonaco(blockElement, null);
        
        if (!shouldLoad) {
            // Not eligible for Monaco - just clear content
            console.log('Block not eligible for Monaco, clearing content');
            clearBlockContent();
            return;
        }
        
        // If clicking on a different eligible block, clear current content first
        if (currentBlockId && monacoEditor) {
            // Clear the current content but keep Monaco instance
            const model = monacoEditor.getModel();
            if (model) {
                model.setValue('<!-- Loading new Advanced Custom HTML content... -->');
            }
        }
        
        currentBlockId = blockId;
        
        // Load Monaco if not already loaded
        const monaco = await loadMonacoEditor();
        if (!monaco || !monacoEditor) return;
        
        // Get block content (HTML only)
        let blockContent = '';
        
        // Method 1: Try to get from block attributes
        if (blockElement.querySelector('[data-block-content]')) {
            blockContent = blockElement.querySelector('[data-block-content]').textContent || '';
        }
        // Method 2: Try to get from block innerHTML
        else if (blockElement.innerHTML) {
            blockContent = blockElement.innerHTML;
        }
        // Method 3: Try to get from block text content
        else {
            blockContent = blockElement.textContent || '';
        }
        
        console.log('Extracted block content:', blockContent.substring(0, 200) + '...');
        
        // Update Monaco editor with HTML content
        const model = monacoEditor.getModel();
        if (model) {
            model.setValue(blockContent || `<!-- Advanced Custom HTML Block: ${blockElement.getAttribute('data-block-type') || 'Unknown'} -->\n<!-- No HTML content available -->`);
        }
        
        console.log(`Loaded HTML content from Advanced Custom HTML block: ${blockElement.getAttribute('data-block-type')} (${blockId})`);
    }
    
    // Update content from Gutenberg block selection
    async function updateBlockContentFromSelection(selectedBlock) {
        if (!selectedBlock) {
            // No block selected - clear content and destroy Monaco
            clearBlockContent();
            return;
        }
        
        const blockId = selectedBlock.clientId;
        
        // If selecting the same block, do nothing
        if (blockId === currentBlockId) return;
        
        // Check if this block should load Monaco (Advanced Custom HTML + split viewMode)
        const shouldLoad = shouldLoadMonaco(null, selectedBlock);
        
        if (!shouldLoad) {
            // Not eligible for Monaco - just clear content
            console.log('Block not eligible for Monaco, clearing content');
            clearBlockContent();
            return;
        }
        
        // If selecting a different eligible block, clear current content first
        if (currentBlockId && monacoEditor) {
            // Clear the current content but keep Monaco instance
            const model = monacoEditor.getModel();
            if (model) {
                model.setValue('<!-- Loading new Advanced Custom HTML content... -->');
            }
        }
        
        currentBlockId = blockId;
        
        // Load Monaco if not already loaded
        const monaco = await loadMonacoEditor();
        if (!monaco || !monacoEditor) return;
        
        let blockContent = '';
        
        // Get HTML content from block attributes
        if (selectedBlock.attributes && selectedBlock.attributes.content) {
            blockContent = selectedBlock.attributes.content;
        } else if (selectedBlock.attributes && selectedBlock.attributes.html) {
            blockContent = selectedBlock.attributes.html;
        } else if (selectedBlock.attributes && selectedBlock.attributes.code) {
            blockContent = selectedBlock.attributes.code;
        }
        
        // Update Monaco editor with HTML content
        const model = monacoEditor.getModel();
        if (model) {
            model.setValue(blockContent || `<!-- Advanced Custom HTML Block: ${selectedBlock.name} -->\n<!-- No HTML content available -->`);
        }
        
        console.log(`Updated HTML content from Advanced Custom HTML Gutenberg selection: ${selectedBlock.name} (${blockId})`);
    }
    
    // Check if a block element is an "Advanced Custom HTML" variant
    function checkIfAdvancedCustomHtml(blockElement) {
        // Check for block type in data attributes
        const blockType = blockElement.getAttribute('data-block-type') || '';
        const blockName = blockElement.getAttribute('data-block-name') || '';
        
        console.log('Checking block for Advanced Custom HTML:');
        console.log('- blockType:', blockType);
        console.log('- blockName:', blockName);
        
        // Check if it's the Advanced Custom HTML variant - more flexible matching
        if (blockType.includes('advanced-custom-html') || 
            blockName.includes('advanced-custom-html') ||
            blockType.includes('dblocks/advanced-custom-html') ||
            blockType.includes('advanced-custom-html') ||
            blockName.includes('advanced-custom-html')) {
            console.log('✓ Matched by block type/name');
            return true;
        }
        
        // Check for variant-specific classes or attributes
        if (blockElement.classList.contains('is-advanced-custom-html') ||
            blockElement.querySelector('[data-variant="advanced-custom-html"]')) {
            console.log('✓ Matched by CSS class or data-variant');
            return true;
        }
        
        // Check for any class that might indicate this is the right block
        const classList = Array.from(blockElement.classList);
        for (const className of classList) {
            if (className.includes('advanced') || className.includes('custom') || className.includes('html')) {
                console.log('✓ Matched by class name:', className);
                return true;
            }
        }
        
        // Check if the block contains HTML content (as a fallback)
        if (blockElement.innerHTML && 
            (blockElement.innerHTML.includes('<') && blockElement.innerHTML.includes('>'))) {
            console.log('✓ Matched by HTML content detection (fallback)');
            return true;
        }
        
        console.log('✗ No match found for Advanced Custom HTML');
        return false;
    }
    
    // Check if a Gutenberg block is an "Advanced Custom HTML" variant
    function checkIfAdvancedCustomHtmlFromGutenberg(selectedBlock) {
        if (!selectedBlock || !selectedBlock.name) return false;
        
        console.log('Checking Gutenberg block for Advanced Custom HTML:');
        console.log('- block name:', selectedBlock.name);
        console.log('- block attributes:', selectedBlock.attributes);
        
        // Check if it's the Advanced Custom HTML variant
        if (selectedBlock.name.includes('advanced-custom-html') ||
            selectedBlock.name.includes('dblocks/advanced-custom-html')) {
            console.log('✓ Matched by block name');
            return true;
        }
        
        // Check for variant-specific attributes
        if (selectedBlock.attributes && 
            (selectedBlock.attributes.variant === 'advanced-custom-html' ||
             selectedBlock.attributes.blockType === 'advanced-custom-html')) {
            console.log('✓ Matched by variant attributes');
            return true;
        }
        
        // Check for any attribute that might indicate this is the right block
        if (selectedBlock.attributes) {
            for (const [key, value] of Object.entries(selectedBlock.attributes)) {
                if (typeof value === 'string' && 
                    (value.includes('advanced') || value.includes('custom') || value.includes('html'))) {
                    console.log('✓ Matched by attribute:', key, value);
                    return true;
                }
            }
        }
        
        console.log('✗ No match found for Advanced Custom HTML in Gutenberg');
        return false;
    }
    
    // Check if a block should load Monaco based on viewMode
    function shouldLoadMonaco(blockElement, selectedBlock) {
        // First check if it's an Advanced Custom HTML block
        const isAdvancedCustomHtml = blockElement ? 
            checkIfAdvancedCustomHtml(blockElement) : 
            checkIfAdvancedCustomHtmlFromGutenberg(selectedBlock);
        
        if (!isAdvancedCustomHtml) {
            console.log('✗ Not an Advanced Custom HTML block');
            return false;
        }
        
        // Check viewMode attribute
        let viewMode = null;
        
        if (blockElement) {
            // Try to get viewMode from DOM attributes
            viewMode = blockElement.getAttribute('data-view-mode') || 
                      blockElement.querySelector('[data-view-mode]')?.getAttribute('data-view-mode');
        } else if (selectedBlock && selectedBlock.attributes) {
            // Try to get viewMode from Gutenberg attributes
            viewMode = selectedBlock.attributes.viewMode;
        }
        
        console.log('View mode detected:', viewMode);
        
        // Only load Monaco if viewMode is "split"
        if (viewMode === 'split') {
            console.log('✓ View mode is "split" - Monaco will load');
            return true;
        } else if (viewMode === 'preview') {
            console.log('✗ View mode is "preview" - Monaco will NOT load');
            return false;
        } else {
            // If no viewMode specified, default to loading Monaco (for backward compatibility)
            console.log('⚠️ No viewMode specified, defaulting to load Monaco');
            return true;
        }
    }
    
    // Clear block content and destroy Monaco
    function clearBlockContent() {
        if (currentBlockId || monacoEditor) {
            currentBlockId = null;
            
            // Destroy Monaco editor
            destroyMonacoEditor();
            
            // Hide the Monaco placeholder and reset height
            const placeholder = document.getElementById("monaco-placeholder");
            if (placeholder) {
                placeholder.style.display = "none";
                // Reset the CSS root variable for proper transitions
                document.documentElement.style.setProperty('--monaco-editor-height', '0px');
            }
            
            console.log('Cleared block content and destroyed Monaco');
        }
    }
    
    // Set up content synchronization from Monaco back to blocks
    function setupContentSync() {
        if (!monacoEditor) return;
        
        // Listen for content changes in Monaco
        monacoEditor.onDidChangeModelContent(() => {
            // Debounce the sync to avoid too many updates
            clearTimeout(window.monacoSyncTimeout);
            window.monacoSyncTimeout = setTimeout(() => {
                syncContentToBlock();
            }, 100); // Wait 100ms after user stops typing for faster sync
        });
        
        console.log("Content sync listener set up");
    }
    
    // Sync Monaco content back to the current block
    function syncContentToBlock() {
        if (!monacoEditor || !currentBlockId) return;
        
        const model = monacoEditor.getModel();
        if (!model) return;
        
        const newContent = model.getValue();
        console.log('Syncing Monaco content to block:', newContent.substring(0, 100) + '...');
        
        // Try to update the block content
        updateBlockContent(newContent);
    }
    
    // Update the actual block content with new Monaco content
    function updateBlockContent(newContent) {
        if (!currentBlockId) return;
        
        // Method 1: Try to update via Gutenberg data API
        if (window.wp && window.wp.data) {
            try {
                const { updateBlockAttributes } = window.wp.data.dispatch('core/block-editor');
                
                // Try different attribute names that might contain the content
                const attributesToUpdate = {};
                
                // Check what attributes the current block has
                const currentBlock = window.wp.data.select('core/block-editor').getBlock(currentBlockId);
                if (currentBlock && currentBlock.attributes) {
                    // Try to find the right attribute to update
                    if (currentBlock.attributes.content !== undefined) {
                        attributesToUpdate.content = newContent;
                    }
                    if (currentBlock.attributes.html !== undefined) {
                        attributesToUpdate.html = newContent;
                    }
                    if (currentBlock.attributes.code !== undefined) {
                        attributesToUpdate.code = newContent;
                    }
                    
                    // Update the block attributes
                    if (Object.keys(attributesToUpdate).length > 0) {
                        updateBlockAttributes(currentBlockId, attributesToUpdate);
                        console.log('Updated block via Gutenberg API:', attributesToUpdate);
                        return;
                    }
                }
            } catch (error) {
                console.log('Gutenberg API update failed, trying DOM update:', error);
            }
        }
        
        // Method 2: Try to update via DOM (fallback)
        try {
            const blockElement = document.querySelector(`[data-block="${currentBlockId}"]`);
            if (blockElement) {
                // Find the content container within the block
                const contentContainer = blockElement.querySelector('[data-block-content]') || 
                                       blockElement.querySelector('.block-content') ||
                                       blockElement.querySelector('.wp-block-content');
                
                if (contentContainer) {
                    contentContainer.innerHTML = newContent;
                    console.log('Updated block via DOM');
                } else {
                    // If no specific content container, try to update the block's innerHTML
                    // This is more aggressive but might be needed
                    blockElement.innerHTML = newContent;
                    console.log('Updated block innerHTML via DOM');
                }
            }
        } catch (error) {
            console.error('DOM update failed:', error);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMonaco);
    } else {
        initMonaco();
    }
})();
