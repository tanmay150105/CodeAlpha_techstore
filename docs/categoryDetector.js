// Category detection utility for TechStore
// Centralizes category logic to avoid duplication

const CategoryDetector = {
    // Category mappings
    categories: {
        'processors': ['cpu', 'processor', 'ryzen', 'intel', 'i3', 'i5', 'i7', 'i9'],
        'graphics': ['gpu', 'graphics', 'rtx', 'gtx', 'nvidia', 'amd', 'radeon'],
        'memory': ['ram', 'memory', 'ddr', 'corsair', 'kingston', 'crucial'],
        'cooling': ['cooler', 'fan', 'cooling', 'noctua', 'arctic', 'thermal'],
        'peripherals': ['keyboard', 'mouse', 'headset', 'monitor', 'speaker', 'logitech', 'razer']
    },

    // SVG image mappings
    svgImages: {
        'processors': './images/cpu.svg',
        'graphics': './images/gpu.svg',
        'memory': './images/ram.svg',
        'cooling': './images/cooler.svg',
        'peripherals': './images/peripheral.svg',
        'generic': './images/generic.svg'
    },

    /**
     * Detect category from product name
     * @param {string} productName - Product name to analyze
     * @param {string} fallbackCategory - Optional fallback category
     * @returns {string} - Detected category or fallback or 'generic'
     */
    detectCategory(productName, fallbackCategory = null) {
        if (!productName) return fallbackCategory || 'generic';
        
        const name = productName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        
        return fallbackCategory || 'generic';
    },

    /**
     * Get SVG image for category
     * @param {string} category - Category name
     * @returns {string} - SVG image path
     */
    getSvgImage(category) {
        return this.svgImages[category] || this.svgImages.generic;
    },

    /**
     * Get category image (alias for getSvgImage for compatibility)
     * @param {string} category - Category name
     * @returns {string} - SVG image path
     */
    getCategoryImage(category) {
        return this.getSvgImage(category);
    },

    /**
     * Get category from element or product name
     * @param {HTMLElement} element - Product card element
     * @returns {string} - Category name
     */
    getCategoryFromElement(element) {
        if (!element) return 'generic';
        
        // Try to get from data attribute first
        const dataCategory = element.getAttribute('data-category');
        if (dataCategory) return dataCategory;
        
        // Try to detect from product name
        const nameElement = element.querySelector('h4, h3, .product-name');
        if (nameElement) {
            return this.detectCategory(nameElement.textContent);
        }
        
        return 'generic';
    },

    /**
     * Check if a category is valid
     * @param {string} category - Category to validate
     * @returns {boolean} - True if valid category
     */
    isValidCategory(category) {
        return category && this.svgImages.hasOwnProperty(category);
    },

    /**
     * Get all available categories
     * @returns {Array<string>} - Array of category names
     */
    getAllCategories() {
        return Object.keys(this.categories);
    },

    /**
     * Get keywords for a specific category
     * @param {string} category - Category name
     * @returns {Array<string>} - Array of keywords
     */
    getCategoryKeywords(category) {
        return this.categories[category] || [];
    }
};

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryDetector;
}
