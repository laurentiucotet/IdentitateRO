/**
 * IdentitateRO Web Component Loader
 * 
 * A custom HTML element for loading Romanian institution logos
 * Framework-agnostic, works with React, Vue, Angular, vanilla HTML, etc.
 * 
 * Usage:
 *   <identity-icon src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@latest/logos/anaf/anaf.svg"></identity-icon>
 * 
 * Features:
 * - Automatic SVG fetching and injection
 * - Built-in caching (loads each SVG only once)
 * - CSS styling support (fill: currentColor)
 * - Error handling with fallback display
 * - Observable attributes (dynamic updates)
 * 
 * @version 1.0.0
 * @license MIT
 */

// Global cache to prevent duplicate downloads
const svgCache = new Map();

class IdentityIcon extends HTMLElement {
  constructor() {
    super();
    this._isLoading = false;
  }

  /**
   * Called when element is added to the DOM
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Define which attributes to observe for changes
   */
  static get observedAttributes() {
    return ['src', 'size'];
  }

  /**
   * Called when an observed attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && !this._isLoading) {
      this.render();
    }
  }

  /**
   * Main rendering logic
   */
  async render() {
    let url = this.getAttribute('src');
    
    if (!url) {
      this.showError('Missing src attribute');
      return;
    }

    // Resolve relative paths to absolute URLs (for local dev / same-origin usage)
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      try {
        url = new URL(url, document.baseURI).href;
      } catch (e) {
        this.showError('Invalid URL: ' + url);
        return;
      }
    }

    // Check cache first
    if (svgCache.has(url)) {
      this.injectSvg(svgCache.get(url));
      return;
    }

    // Show loading state
    this.showLoading();
    this._isLoading = true;

    try {
      // Fetch SVG content
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isSvg = contentType.includes('svg') || contentType.includes('xml') || url.endsWith('.svg');
      if (!isSvg) {
        throw new Error('Response is not an SVG file');
      }

      const svgContent = await response.text();

      // Basic security: remove script tags
      const cleanedSvg = this.sanitizeSvg(svgContent);

      // Save to cache
      svgCache.set(url, cleanedSvg);

      // Inject into DOM
      this.injectSvg(cleanedSvg);

    } catch (error) {
      console.error('[IdentitateRO] Failed to load logo:', url, error);
      this.showError(error.message);
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Remove potentially dangerous content from SVG
   */
  sanitizeSvg(svgContent) {
    // Remove script tags and event handlers
    return svgContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }

  /**
   * Inject SVG content into the element
   */
  injectSvg(svgContent) {
    this.innerHTML = svgContent;

    // Configure SVG element for CSS styling
    const svg = this.querySelector('svg');
    if (svg) {
      // Make SVG responsive
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      
      // Enable CSS color control
      svg.style.fill = 'currentColor';
      
      // Preserve aspect ratio
      if (!svg.hasAttribute('viewBox') && svg.hasAttribute('width') && svg.hasAttribute('height')) {
        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      // Apply size attribute if present
      const size = this.getAttribute('size');
      if (size) {
        this.style.width = size;
        this.style.height = size;
      }

      // Ensure display is set
      if (!this.style.display || this.style.display === '') {
        this.style.display = 'inline-block';
      }
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.innerHTML = `<span style="opacity: 0.5; font-size: 0.75em;">⏳</span>`;
    this.setAttribute('aria-busy', 'true');
  }

  /**
   * Show error state
   */
  showError(message) {
    this.innerHTML = `<span style="opacity: 0.5; font-size: 0.75em;" title="${message}">⚠️</span>`;
    this.setAttribute('aria-invalid', 'true');
    this.removeAttribute('aria-busy');
  }
}

// Register the custom element
if (!customElements.get('identity-icon')) {
  customElements.define('identity-icon', IdentityIcon);
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IdentityIcon;
}
