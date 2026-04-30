/**
 * Language Selector Popup
 * Manages the language selection popup and redirect functionality with glass morphism design.
 */
class LanguageSelector {
    constructor() {
        // Language data with names and external links
        this.languages = [
            { code: 'en', name: 'English', localName: 'English', link: 'https://hyalurion.github.io/self-info-en' },
            { code: 'ja', name: '日本語', localName: 'Japanese', link: 'https://self-info-ja.netlify.app/' },
            { code: 'zh-Hans', name: '华文', localName: 'Simplified Chinese (SEA)', link: 'https://self-info-zh-hans.netlify.app/' },
            { code: 'zh-TW', name: '繁體中文（台灣）', localName: 'Traditional Chinese (Taiwan)', link: 'https://hyalurion.github.io/self-info-zh-tw/' },
        ];
        
        // Store original languages for restoration
        this.originalLanguages = [...this.languages];
        
        // Initialize the language selector
        this.init();
    }
    
    /**
     * Initializes the language selector by creating the button and popup elements.
     */
    init() {
        // Create language selector button
        this.createLanguageButton();
        
        // Create language popup
        this.createLanguagePopup();
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    /**
     * Creates the language selector button and adds it to the DOM.
     */
    createLanguageButton() {
        const button = document.createElement('button');
        button.id = 'language-button';
        button.className = 'language-button';
        button.innerHTML = '🌐';
        
        // Add touch feedback for mobile devices
        button.style.touchAction = 'manipulation';
        button.style.webkitTapHighlightColor = 'transparent';
        
        document.body.appendChild(button);
        this.button = button;
    }
    
    /**
     * Creates the language selection popup and adds it to the DOM.
     */
    createLanguagePopup() {
        const popup = document.createElement('div');
        popup.id = 'language-popup';
        popup.className = 'language-popup hidden';
        
        // Add a header to the popup
        const header = document.createElement('div');
        header.className = 'popup-header';
        header.textContent = '';
        popup.appendChild(header);
        
        // Add languages to the popup
        this.updateLanguageItems(popup);
        
        document.body.appendChild(popup);
        this.popup = popup;
    }
    
    /**
     * Updates language items in the popup
     */
    updateLanguageItems(popup) {
        // Remove existing language items (keep header)
        const existingItems = popup.querySelectorAll('.language-item');
        existingItems.forEach(item => item.remove());
        
        // Add current languages to the popup
        this.languages.forEach(lang => {
            const languageItem = document.createElement('a');
            languageItem.href = lang.link;
            languageItem.target = '_blank';
            languageItem.className = 'language-item';
            
            // Add language names with simplified typography
            languageItem.innerHTML = `
                <div class="language-name">${lang.name}</div>
                <div class="language-local-name">${lang.localName}</div>
            `;
            
            popup.appendChild(languageItem);
        });
    }
    
    /**
     * Sets up event listeners for the language selector.
     */
    setupEventListeners() {
        // Toggle popup on button click
        this.button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from closing the popup immediately
            this.togglePopup();
        });
        
        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.popup.contains(e.target) && e.target !== this.button) {
                this.hidePopup();
            }
        });
        
        // Close popup when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePopup();
            }
        });
        
        // Make popup accessible by keyboard navigation
        this.button.setAttribute('aria-haspopup', 'true');
        this.button.setAttribute('aria-expanded', 'false');
    }
    
    /**
     * Toggles the visibility of the language popup.
     */
    togglePopup() {
        if (this.popup.classList.contains('hidden')) {
            this.showPopup();
        } else {
            this.hidePopup();
        }
    }
    
    /**
     * Shows the language popup with enhanced animation.
     */
    showPopup() {
        this.popup.classList.remove('hidden');
        
        // Apply fade-in effect through CSS
        setTimeout(() => {
            this.popup.classList.add('visible');
        }, 10);
        
        this.button.setAttribute('aria-expanded', 'true');
        
        // Prevent body from scrolling when popup is open on mobile
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Hides the language popup with enhanced animation.
     */
    hidePopup() {
        this.popup.classList.remove('visible');
        
        // Hide after fade-out animation completes
        setTimeout(() => {
            this.popup.classList.add('hidden');
        }, 300);
        
        this.button.setAttribute('aria-expanded', 'false');
        
        // Allow body to scroll again when popup is closed
        document.body.style.overflow = '';
    }
    
    /**
     * Get user's browser language preference
     * @returns {string} Browser language code
     */
    getUserBrowserLanguage() {
        return navigator.language || navigator.userLanguage;
    }
    
    /**
     * Determine recommended languages based on location and browser language
     * @param {string} browserLang - Browser language code
     * @returns {Array} Array of recommended language objects
     */
    getRecommendedLanguages(browserLang) {
        const recommendations = [];
        
        // Priority 2: Handle Chinese language variants based on browser language
        if (browserLang && browserLang.toLowerCase().startsWith('zh-')) {
            const lowerCaseBrowserLang = browserLang.toLowerCase();
            
            // Traditional Chinese variants (Hong Kong, Macau, Taiwan)
            const traditionalVariants = ['zh-hk', 'zh-mo', 'zh-tw'];
            const isTraditionalVariant = traditionalVariants.some(variant => 
                lowerCaseBrowserLang === variant || lowerCaseBrowserLang.startsWith(variant + '-')
            );
            
            if (isTraditionalVariant) {
                // Use Traditional Chinese (Taiwan) for HK, MO, TW
                const zhTWLang = this.originalLanguages.find(lang => lang.code === 'zh-TW');
                if (zhTWLang) {
                    recommendations.push(zhTWLang);
                    console.log(`Traditional Chinese variant detected (${browserLang}) - recommending zh-TW`);
                }
            } else {
                // For other Chinese variants (zh-sg, zh-my, zh-cn, etc.), use Simplified Chinese (SEA)
                const zhHansLang = this.originalLanguages.find(lang => lang.code === 'zh-Hans');
                if (zhHansLang) {
                    recommendations.push(zhHansLang);
                    console.log(`Other Chinese variant detected (${browserLang}) - recommending zh-Hans`);
                }
            }
            
            return recommendations;
        }
        
        // Priority 3: Check for exact language match (non-Chinese languages)
        if (browserLang) {
            const exactMatch = this.originalLanguages.find(lang => 
                lang.code === browserLang || 
                lang.code === browserLang.split('-')[0] ||
                browserLang.startsWith(lang.code.split('-')[0])
            );
            if (exactMatch && !exactMatch.code.startsWith('zh-')) {
                recommendations.push(exactMatch);
                console.log(`Exact language match found: ${exactMatch.code}`);
            }
        }
        
        // Priority 4: If no match, add Japanese and English as fallbacks
        if (recommendations.length === 0) {
            const japanese = this.originalLanguages.find(lang => lang.code === 'ja');
            const english = this.originalLanguages.find(lang => lang.code === 'en');
            
            if (japanese) recommendations.push(japanese);
            if (english) recommendations.push(english);
            
            console.log('No specific match - using Japanese and English fallbacks');
        }
        
        return recommendations;
    }
    
    /**
     * Updates the language popup with current languages array
     */
    updateLanguagePopup() {
        if (this.popup) {
            this.updateLanguageItems(this.popup);
        }
    }
}

// Initialize the language selector when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const languageSelector = new LanguageSelector();
    
    // Make the language selector accessible globally for debugging
    window.languageSelector = languageSelector;
    
    // Function to update main page language display
    window.updateMainPageLanguage = (result) => {
        const { recommendedLangs, detectedLanguage } = result;
        
        // Show language text
        document.querySelectorAll('.language-text p').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelectorAll('#language-recommendation h3').forEach(el => {
            el.classList.add('hidden');
        });
        
        const langElements = document.querySelectorAll(`.lang-${detectedLanguage}`);
        if (langElements.length > 0) {
            langElements.forEach(el => {
                el.classList.add('active');
                el.classList.remove('hidden');
            });
        } else {
            // Fallback to English
            document.querySelectorAll('.lang-en').forEach(el => {
                el.classList.add('active');
                el.classList.remove('hidden');
            });
        }
        
        // Update feedback button
        document.querySelectorAll('.feedback-text').forEach(el => {
            el.classList.remove('active');
        });
        const feedbackElement = document.querySelector(`.feedback-text.lang-${detectedLanguage}`);
        if (feedbackElement) {
            feedbackElement.classList.add('active');
        } else {
            document.querySelector('.feedback-text.lang-en').classList.add('active');
        }
        
        // Update changelog button
        document.querySelectorAll('.changelog-text').forEach(el => {
            el.classList.remove('active');
        });
        const changelogElement = document.querySelector(`.changelog-text.lang-${detectedLanguage}`);
        if (changelogElement) {
            changelogElement.classList.add('active');
        } else {
            document.querySelector('.changelog-text.lang-en').classList.add('active');
        }
        
        // Display recommendations
        const langsContainer = document.getElementById('recommended-langs');
        if (langsContainer) {
            langsContainer.innerHTML = '';
            
            recommendedLangs.slice(0, 4).forEach(lang => {
                const link = document.createElement('a');
                link.href = lang.link;
                link.target = '_blank';
                link.className = 'recommended-lang';
                link.textContent = lang.name;
                langsContainer.appendChild(link);
            });
        }
        
        console.log(`Main page updated with language: ${detectedLanguage}`);
    };
    
    // If there's a stored test mode, apply it before checking location
    const storedTestMode = localStorage.getItem('testMode');
    if (storedTestMode) {
        console.log(`Restoring test mode: ${storedTestMode}`);
        if (typeof applyTestMode === 'function') {
            await applyTestMode(storedTestMode);
        }
    } else {
        // Apply location-based language restrictions as usual
        try {
            // Get browser language
            const browserLang = navigator.language || navigator.userLanguage;
            
            // Get recommended languages based on browser language
            const recommendedLangs = languageSelector.getRecommendedLanguages(browserLang);
            
            // Create result object
            const result = {
                recommendedLangs: recommendedLangs,
                detectedLanguage: recommendedLangs.length > 0 ? recommendedLangs[0].code : 'en'
            };
            
            window.updateMainPageLanguage(result);
        } catch (error) {
            console.error('Error applying location-based restrictions:', error);
            // Continue with default languages if there's an error
            const defaultResult = {
                recommendedLangs: [languageSelector.originalLanguages.find(lang => lang.code === 'en')],
                detectedLanguage: 'en'
            };
            window.updateMainPageLanguage(defaultResult);
        }
    }
    
    // Function to apply test mode for a specific language
    window.applyTestMode = async function(languageCode) {
        console.log(`Applying test mode for language: ${languageCode}`);
        
        // Find the language data
        const language = languageSelector.originalLanguages.find(lang => lang.code === languageCode);
        
        if (language) {
            // Store test mode in localStorage for persistence
            localStorage.setItem('testMode', languageCode);
            
            // Apply the language
            const result = {
                recommendedLangs: [language],
                detectedLanguage: languageCode
            };
            
            window.updateMainPageLanguage(result);
            console.log(`Test mode activated for: ${language.name}`);
        } else {
            console.error(`Language code '${languageCode}' not found for test mode`);
        }
    };
    
    // Test function to switch languages for debugging
    window.testLanguage = function(languageCode) {
        localStorage.setItem('testMode', languageCode);
        location.reload();
    };
    
    // Print debugging instructions to console
    console.log('%cLanguage Selector Debugging Tools:', 'color: #6366f1; font-weight: bold; font-size: 14px;'); 
    console.log('%c• languageSelector', 'color: #10b981;', '- Access the language selector instance directly');
    console.log('%c• testLanguage("en")', 'color: #10b981;', '- Test English language display');
    console.log('%c• testLanguage("ja")', 'color: #10b981;', '- Test Japanese language display');
    console.log('%c• testLanguage("zh-Hans")', 'color: #10b981;', '- Test Simplified Chinese (SEA) language display');
    console.log('%c• testLanguage("zh-TW")', 'color: #10b981;', '- Test Traditional Chinese (Taiwan) language display');
    console.log('%cTest mode will persist across page refresh', 'color: #f59e0b; font-style: italic;');
    console.log('%c\nLanguage Logic:', 'color: #8b5cf6; font-weight: bold;');
    console.log('%c• zh-hk/mo/tw browser → zh-TW (繁體中文)', 'color: #6b7280;');
    console.log('%c• Other Chinese (zh-sg/my/etc) → zh-Hans (华文)', 'color: #6b7280;');
});
