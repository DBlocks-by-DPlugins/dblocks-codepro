// Simple Monaco Loader - Prevents duplicate loading and _amdLoaderGlobal conflicts

let monacoLoaded = false;
let monacoPromise = null;

const MONACO_PATH = `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs`;

export const loadMonaco = async () => {
    // Return existing instance if already loaded
    if (monacoLoaded && window.monaco) {
        return window.monaco;
    }
    
    // If already loading, wait for that promise
    if (monacoPromise) {
        return monacoPromise;
    }
    
    // Start loading
    monacoPromise = new Promise(async (resolve, reject) => {
        try {
            // Check if Monaco is already loaded
            if (window.monaco) {
                monacoLoaded = true;
                resolve(window.monaco);
                return;
            }
            
            // Check if loader.js is already loaded to prevent _amdLoaderGlobal conflicts
            const existingLoader = Array.from(document.scripts).some(script => 
                script.src.includes('loader.js')
            );
            
            if (!existingLoader) {
                // Load Monaco loader only once
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = `${MONACO_PATH}/loader.js`;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

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
                paths: { 'vs': MONACO_PATH }
            });

            // Load Monaco editor
            window.require(['vs/editor/editor.main'], (monaco) => {
                monacoLoaded = true;
                monacoPromise = null;
                resolve(monaco);
            }, reject);
            
        } catch (error) {
            console.error('Failed to load Monaco:', error);
            monacoPromise = null;
            reject(error);
        }
    });
    
    return monacoPromise;
};
