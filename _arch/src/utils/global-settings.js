/**
 * Shared global settings utilities for both editor and frontend
 * Includes localStorage caching for improved performance
 */

const CACHE_KEY = 'dblocks_global_settings_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Create a global settings API client
 * @param {string} baseUrl - The base URL for API calls
 * @param {string} context - Context for error logging (e.g., 'Editor', 'Frontend')
 * @returns {Object} Object with all global settings fetch functions
 */
export const createGlobalSettingsClient = (baseUrl, context = '') => {
    const logPrefix = context ? `${context}: ` : '';
    
    /**
     * Cache management functions
     */
    const getCachedSettings = () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is still valid
            if (now - timestamp < CACHE_EXPIRY) {
                return data;
            }
            
            // Cache expired, remove it
            localStorage.removeItem(CACHE_KEY);
            return null;
        } catch (error) {
            console.log(`${logPrefix}Failed to read cached settings:`, error);
            return null;
        }
    };

    const setCachedSettings = (settings) => {
        try {
            const cacheData = {
                data: settings,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.log(`${logPrefix}Failed to cache settings:`, error);
        }
    };

    const clearCache = () => {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            console.log(`${logPrefix}Failed to clear cache:`, error);
        }
    };
    
    /**
     * Generic fetch function for global settings
     * @param {string} endpoint - The endpoint to fetch from
     * @param {string} settingName - Name of the setting for error logging
     * @param {*} defaultValue - Default value to return on error
     * @param {Function} transformer - Optional transformer function for the value
     * @returns {Promise<*>} The setting value or default
     */
    const fetchGlobalSetting = async (endpoint, settingName, defaultValue, transformer = null) => {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`);
            if (response.ok) {
                const rawValue = await response.text();
                const cleanValue = rawValue.trim().replace(/"/g, '').replace(/'/g, '');
                
                if (transformer) {
                    return transformer(cleanValue) || defaultValue;
                }
                
                return cleanValue || defaultValue;
            }
        } catch (error) {
            console.log(`${logPrefix}Could not fetch global ${settingName}, using default`);
        }
        return defaultValue;
    };

    /**
     * Transform string to boolean (handles 'true'/'false' and '1'/'0')
     */
    const booleanTransformer = (value) => {
        return value === 'true' || value === '1';
    };

    return {
        // Theme settings
        getGlobalEditorTheme: async () => {
            const theme = await fetchGlobalSetting('syntax-theme/', 'editor theme', 'light');
            return theme === 'dark' ? 'dark' : 'light';
        },

        // Display settings
        getGlobalDisplayLanguage: () => 
            fetchGlobalSetting('display-language/', 'display language', true, booleanTransformer),

        getGlobalCopyButton: () => 
            fetchGlobalSetting('copy-button/', 'copy button', true, booleanTransformer),

        getGlobalDisplayRowNumbers: () => 
            fetchGlobalSetting('display-row-numbers/', 'display row numbers', false, booleanTransformer),

        // Typography settings
        getGlobalFontSize: () => 
            fetchGlobalSetting('font-size/', 'font size', '14px'),

        getGlobalLineHeight: () => 
            fetchGlobalSetting('line-height/', 'line height', '20px'),

        getGlobalLetterSpacing: () => 
            fetchGlobalSetting('letter-spacing/', 'letter spacing', '0px'),

        // Layout settings
        getGlobalIndentWidth: () => 
            fetchGlobalSetting('indent-width/', 'indent width', '4px'),

        getGlobalWordWrap: () => 
            fetchGlobalSetting('word-wrap/', 'word wrap', false, booleanTransformer),

        getGlobalAutoResizeHeight: () => 
            fetchGlobalSetting('auto-resize-height/', 'auto-resize height', false, booleanTransformer),

        // Fetch all settings at once with caching
        async fetchAllGlobalSettings(forceRefresh = false) {
            // Try to get from cache first (unless force refresh is requested)
            if (!forceRefresh) {
                const cached = getCachedSettings();
                if (cached) {
                    console.log(`${logPrefix}Using cached global settings`);
                    return cached;
                }
            }

            console.log(`${logPrefix}Fetching fresh global settings from API`);
            
            const [
                theme,
                displayLanguage,
                copyButton,
                displayRowNumbers,
                fontSize,
                lineHeight,
                letterSpacing,
                indentWidth,
                wordWrap,
                autoResizeHeight
            ] = await Promise.all([
                this.getGlobalEditorTheme(),
                this.getGlobalDisplayLanguage(),
                this.getGlobalCopyButton(),
                this.getGlobalDisplayRowNumbers(),
                this.getGlobalFontSize(),
                this.getGlobalLineHeight(),
                this.getGlobalLetterSpacing(),
                this.getGlobalIndentWidth(),
                this.getGlobalWordWrap(),
                this.getGlobalAutoResizeHeight()
            ]);

            const settings = {
                theme,
                displayLanguage,
                copyButton,
                displayRowNumbers,
                fontSize,
                lineHeight,
                letterSpacing,
                indentWidth,
                wordWrap,
                autoResizeHeight
            };

            // Cache the settings
            setCachedSettings(settings);
            
            return settings;
        },

        // Cache management functions
        clearCache,
        getCachedSettings,
        
        // Force refresh cache
        forceRefreshCache: () => clearCache(),
        
        // Check if cache is stale (older than 1 minute for theme changes)
        isCacheStale: () => {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (!cached) return true;
                
                const { timestamp } = JSON.parse(cached);
                const now = Date.now();
                const themeCacheExpiry = 1 * 60 * 1000; // 1 minute for theme
                
                return (now - timestamp) > themeCacheExpiry;
            } catch (error) {
                return true;
            }
        }
    };
};

/**
 * Default global settings client for frontend (uses hardcoded URL)
 */
export const frontendGlobalSettings = createGlobalSettingsClient('/wp-json/dblocks_codepro/v1/', 'Frontend');

/**
 * Create editor global settings client (uses dynamic baseUrl)
 * @param {string} baseUrl - Dynamic base URL from editor context
 * @returns {Object} Global settings client for editor
 */
export const createEditorGlobalSettings = (baseUrl) => 
    createGlobalSettingsClient(baseUrl, 'Editor');

/**
 * Clear global settings cache (useful when admin updates settings)
 */
export const clearGlobalSettingsCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('Global settings cache cleared');
    } catch (error) {
        console.log('Failed to clear global settings cache:', error);
    }
};
