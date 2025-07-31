/**
 * Main application entry point for Map Remix
 * Initializes all components and sets up the application
 */

import { MapController } from './map/MapController.js';
import { AppState } from './state/AppState.js';
import { LayerControls } from './ui/LayerControls.js';
import { StyleControls } from './ui/StyleControls.js';
import { ExportControls } from './ui/ExportControls.js';
import { ErrorDisplay } from './ui/ErrorDisplay.js';
import { ThemeSelector } from './ui/ThemeSelector.js';
import { supportsFeature } from './utils/helpers.js';

class MapRemixApp {
  constructor() {
    this.appState = null;
    this.mapController = null;
    this.layerControls = null;
    this.styleControls = null;
    this.exportControls = null;
    this.errorDisplay = null;
    this.themeSelector = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Map Remix...');

      // Check browser compatibility
      this._checkBrowserCompatibility();

      // Initialize components
      await this._initializeComponents();

      // Setup UI event listeners
      this._setupUIEventListeners();

      // Setup network monitoring
      this._setupNetworkMonitoring();

      // Setup keyboard shortcuts
      this._setupKeyboardShortcuts();

      this.isInitialized = true;
      console.log('Map Remix initialized successfully!');

      // Show welcome message
      this.errorDisplay.showSuccess('Map Remix loaded successfully! Start editing your map style.');

    } catch (error) {
      console.error('Failed to initialize Map Remix:', error);
      this._showInitializationError(error);
    }
  }

  /**
   * Check browser compatibility
   * @private
   */
  _checkBrowserCompatibility() {
    const issues = [];

    if (!supportsFeature('webgl')) {
      issues.push('WebGL is not supported. Vector tile rendering may not work.');
    }

    if (!supportsFeature('colorInput')) {
      console.warn('Native color picker not supported, falling back to text input');
    }

    if (!navigator.onLine) {
      issues.push('You appear to be offline. Tile loading may fail.');
    }

    if (issues.length > 0) {
      setTimeout(() => {
        issues.forEach(issue => {
          this.errorDisplay?.showWarning(issue);
        });
      }, 1000);
    }
  }

  /**
   * Initialize core components
   * @private
   */
  async _initializeComponents() {
    // Initialize application state
    this.appState = new AppState();

    // Initialize error display first
    const errorContainer = document.getElementById('error-display');
    this.errorDisplay = new ErrorDisplay(errorContainer, this.appState);

    // Initialize map controller
    this.mapController = new MapController('map');
    await this.mapController.initializeMap();

    // Initialize UI components
    const layerControlsContainer = document.getElementById('layer-controls');
    this.layerControls = new LayerControls(layerControlsContainer, this.appState, this.mapController);

    const styleControlsContainer = document.getElementById('style-controls');
    this.styleControls = new StyleControls(styleControlsContainer, this.appState, this.mapController);

    const themeSelectorContainer = document.getElementById('theme-selector');
    this.themeSelector = new ThemeSelector(themeSelectorContainer, this.appState, this.mapController);

    // Initialize export controls
    this.exportControls = new ExportControls(this.appState, this.mapController);

    console.log('Core components initialized');
  }

  /**
   * Setup UI event listeners for buttons and interactions
   * @private
   */
  _setupUIEventListeners() {
    // Export JSON button
    const exportJsonBtn = document.getElementById('export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', async () => {
        const result = await this.exportControls.exportStyleJSON();
        if (!result.success) {
          this.errorDisplay.showError(result.error);
        }
      });
    }

    // Export PNG button
    const exportPngBtn = document.getElementById('export-png');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', async () => {
        const result = await this.exportControls.exportPNG();
        if (!result.success) {
          this.errorDisplay.showError(result.error);
        }
      });
    }

    // Reset style button
    const resetBtn = document.getElementById('reset-style');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset to default style? This will lose all your changes.')) {
          this.appState.resetToDefault();
          this.mapController.updateStyle(this.appState.getCurrentStyle());
          this.errorDisplay.showInfo('Style reset to default');
        }
      });
    }

    // File import handling (drag and drop)
    this._setupFileImport();

    console.log('UI event listeners setup complete');
  }

  /**
   * Setup file import via drag and drop
   * @private
   */
  _setupFileImport() {
    const mapContainer = document.getElementById('map');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      mapContainer.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Visual feedback for drag over
    mapContainer.addEventListener('dragenter', () => {
      mapContainer.style.opacity = '0.7';
      this.errorDisplay.showInfo('Drop JSON file to import style', { persistent: true });
    });

    mapContainer.addEventListener('dragleave', (e) => {
      // Only reset if we're leaving the container entirely
      if (!mapContainer.contains(e.relatedTarget)) {
        mapContainer.style.opacity = '1';
        this.errorDisplay.hideInfo();
      }
    });

    // Handle file drop
    mapContainer.addEventListener('drop', async (e) => {
      mapContainer.style.opacity = '1';
      this.errorDisplay.hideInfo();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const result = await this.exportControls.importStyleJSON(file);
          if (!result.success) {
            this.errorDisplay.showError(result.error);
          }
        } else {
          this.errorDisplay.showError('Please drop a JSON file');
        }
      }
    });
  }

  /**
   * Setup network monitoring
   * @private
   */
  _setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.errorDisplay.showNetworkStatus(true);
      this.errorDisplay.showSuccess('Connection restored');
    });

    window.addEventListener('offline', () => {
      this.errorDisplay.showNetworkStatus(false);
    });

    // Initial network status check
    if (!navigator.onLine) {
      setTimeout(() => {
        this.errorDisplay.showNetworkStatus(false);
      }, 1000);
    }
  }

  /**
   * Setup keyboard shortcuts
   * @private
   */
  _setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (this.appState.undo()) {
          this.mapController.updateStyle(this.appState.getCurrentStyle());
          this.errorDisplay.showInfo('Undone');
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (this.appState.redo()) {
          this.mapController.updateStyle(this.appState.getCurrentStyle());
          this.errorDisplay.showInfo('Redone');
        }
      }

      // Ctrl/Cmd + S - Export JSON
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.exportControls.exportStyleJSON();
      }

      // Ctrl/Cmd + E - Export PNG
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.exportControls.exportPNG();
      }

      // R - Reset style (with confirmation)
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
        if (confirm('Reset to default style? This will lose all your changes.')) {
          this.appState.resetToDefault();
          this.mapController.updateStyle(this.appState.getCurrentStyle());
          this.errorDisplay.showInfo('Style reset to default');
        }
      }

      // Escape - Clear all error messages
      if (e.key === 'Escape') {
        this.errorDisplay.clearAll();
      }
    });

    // Show keyboard shortcuts on first load
    setTimeout(() => {
      this.errorDisplay.showInfo('Keyboard shortcuts: Ctrl+Z (undo), Ctrl+S (export JSON), Ctrl+E (export PNG), R (reset)', {
        autoHide: true
      });
    }, 3000);
  }

  /**
   * Show initialization error
   * @private
   * @param {Error} error - Initialization error
   */
  _showInitializationError(error) {
    // Create fallback error display if ErrorDisplay failed to initialize
    const errorContainer = document.getElementById('error-display') || document.body;
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 400px;
      z-index: 10000;
    `;
    
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Initialization Failed</h3>
      <p style="margin: 0 0 10px 0;">${error.message}</p>
      <p style="margin: 0; font-size: 0.9em; opacity: 0.9;">
        Please check the browser console for more details and ensure you have a modern browser with WebGL support.
      </p>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">Dismiss</button>
    `;
    
    errorContainer.appendChild(errorDiv);
  }

  /**
   * Cleanup and destroy the application
   */
  destroy() {
    if (this.layerControls) {
      this.layerControls.destroy();
    }
    if (this.styleControls) {
      this.styleControls.destroy();
    }
    if (this.themeSelector) {
      this.themeSelector.destroy();
    }
    if (this.errorDisplay) {
      this.errorDisplay.destroy();
    }
    if (this.mapController) {
      this.mapController.cleanup();
    }
    
    this.isInitialized = false;
    console.log('Map Remix destroyed');
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mapRemixApp = new MapRemixApp();
  window.mapRemixApp.init().catch(error => {
    console.error('Failed to start Map Remix:', error);
  });
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.mapRemixApp) {
    window.mapRemixApp.destroy();
  }
});

// Export for testing/debugging
export { MapRemixApp };