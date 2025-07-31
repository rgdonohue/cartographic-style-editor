/**
 * ThemeSelector - UI component for selecting and applying themes
 * Creates buttons for each available theme
 */

import { themes, getTheme } from '../styles/themes.js';

export class ThemeSelector {
  /**
   * Initialize ThemeSelector
   * @param {HTMLElement} container - Container element
   * @param {AppState} appState - Application state instance
   * @param {MapController} mapController - Map controller instance
   */
  constructor(container, appState, mapController) {
    this.container = container;
    this.appState = appState;
    this.mapController = mapController;
    this.themeButtons = new Map();
    
    this._setupEventListeners();
    this._render();
  }

  /**
   * Setup event listeners for state changes
   * @private
   */
  _setupEventListeners() {
    // Listen for theme changes
    this.appState.on('themeChanged', (data) => {
      this._updateActiveTheme(data.themeName);
    });

    // Listen for style resets
    this.appState.on('styleReset', () => {
      this._updateActiveTheme('default');
    });
  }

  /**
   * Render theme selector buttons
   * @private
   */
  _render() {
    // Clear existing buttons
    this.container.innerHTML = '';
    this.themeButtons.clear();

    // Create button for each theme
    for (const [themeName, themeData] of Object.entries(themes)) {
      const button = this._createThemeButton(themeName, themeData);
      this.container.appendChild(button);
      this.themeButtons.set(themeName, button);
    }

    // Set initial active theme
    this._updateActiveTheme(this.appState.activeTheme);
  }

  /**
   * Create a theme button
   * @private
   * @param {string} themeName - Theme name
   * @param {Object} themeData - Theme configuration
   * @returns {HTMLElement} Button element
   */
  _createThemeButton(themeName, themeData) {
    const button = document.createElement('button');
    button.className = 'theme-button';
    button.textContent = themeData.name;
    button.title = themeData.description;
    button.setAttribute('aria-label', `Apply ${themeData.name} theme: ${themeData.description}`);
    
    // Add click handler
    button.addEventListener('click', () => {
      this._applyTheme(themeName);
    });

    // Add keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._applyTheme(themeName);
      }
    });

    return button;
  }

  /**
   * Apply a theme
   * @private
   * @param {string} themeName - Theme name
   */
  async _applyTheme(themeName) {
    try {
      const themeData = getTheme(themeName);
      if (!themeData) {
        throw new Error(`Theme ${themeName} not found`);
      }

      // Disable all buttons during application
      this._setButtonsEnabled(false);

      // Apply theme through app state
      const success = await this.appState.applyTheme(themeName, themeData);
      
      if (success) {
        // Update map with new style
        this.mapController.updateStyle(this.appState.getCurrentStyle());
        
        // Show success message
        this.appState.emit('themeApplied', {
          themeName,
          themeName: themeData.name
        });
      } else {
        throw new Error('Failed to apply theme');
      }

    } catch (error) {
      console.error(`Failed to apply theme ${themeName}:`, error);
      this.appState.addError({
        type: 'themeApplication',
        message: `Failed to apply ${themeName} theme`,
        error
      });
    } finally {
      // Re-enable buttons
      this._setButtonsEnabled(true);
    }
  }

  /**
   * Update active theme visual state
   * @private
   * @param {string} activeThemeName - Currently active theme name
   */
  _updateActiveTheme(activeThemeName) {
    // Remove active class from all buttons
    for (const [themeName, button] of this.themeButtons) {
      button.classList.toggle('active', themeName === activeThemeName);
      button.setAttribute('aria-pressed', themeName === activeThemeName ? 'true' : 'false');
    }
  }

  /**
   * Enable/disable all theme buttons
   * @private
   * @param {boolean} enabled - Enable state
   */
  _setButtonsEnabled(enabled) {
    for (const [themeName, button] of this.themeButtons) {
      button.disabled = !enabled;
    }
  }

  /**
   * Get current active theme
   * @returns {string} Active theme name
   */
  getActiveTheme() {
    return this.appState.activeTheme;
  }

  /**
   * Set active theme programmatically
   * @param {string} themeName - Theme name to activate
   */
  setActiveTheme(themeName) {
    this._applyTheme(themeName);
  }

  /**
   * Enable/disable the entire component
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    this._setButtonsEnabled(enabled);
    this.container.classList.toggle('disabled', !enabled);
  }

  /**
   * Destroy the component and cleanup
   */
  destroy() {
    // Remove event listeners
    this.appState.off('themeChanged', this._updateActiveTheme);
    this.appState.off('styleReset', this._updateActiveTheme);

    // Clear DOM
    this.container.innerHTML = '';
    this.themeButtons.clear();
  }
}