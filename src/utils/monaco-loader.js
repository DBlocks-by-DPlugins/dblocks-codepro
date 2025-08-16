// Shared Monaco Editor Loader
// This prevents duplicate loading of Monaco between editor and frontend

let monacoLoaded = false;
let monacoPromise = null;

const MONACO_PATH = `${window.location.origin}/wp-content/plugins/dblocks-codepro/vendor/monaco/min/vs`;

export const loadMonaco = async () => {
    // If already loaded, return existing instance
    if (monacoLoaded && window.monaco) {
        return window.monaco;
    }
    
    // If already loading, wait for that promise
    if (monacoPromise) {
        return monacoPromise;
    }
    
    // Start loading Monaco
    monacoPromise = new Promise(async (resolve, reject) => {
        try {
            // Check if Monaco is already loaded by another instance
            if (window.monaco) {
                monacoLoaded = true;
                resolve(window.monaco);
                return;
            }
            
            // Check if loader.js is already loaded
            const existingLoader = Array.from(document.scripts).some(script => 
                script.src.includes('loader.js')
            );
            
            if (!existingLoader) {
                // Load Monaco loader
                const script = document.createElement('script');
                script.src = `${MONACO_PATH}/loader.js`;
                
                await new Promise((scriptResolve, scriptReject) => {
                    script.onload = scriptResolve;
                    script.onerror = scriptReject;
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
                paths: {
                    'vs': MONACO_PATH
                }
            });

            // Load Monaco editor
            window.require(['vs/editor/editor.main'], (monaco) => {
                monacoLoaded = true;
                resolve(monaco);
            }, reject);
            
        } catch (error) {
            console.error('Failed to load Monaco:', error);
            reject(error);
        }
    });
    
    return monacoPromise;
};

// Export the path for other components that need it
export const getMonacoPath = () => MONACO_PATH;
