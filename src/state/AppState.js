/**
 * AppState - Central application state store
 * Manages all user interactions and map configuration with event system
 */

import { defaultStyle, layerConfig } from '../styles/defaultStyle.js';
import { deepClone } from '../utils/helpers.js';

export class AppState {
  /**
   * Initialize application state
   */
  constructor() {
    this.currentStyle = deepClone(defaultStyle);
    this.layerVisibility = this._initializeLayerVisibility();
    this.styleHistory = [deepClone(this.currentStyle)];
    this.historyIndex = 0;
    this.activeTheme = 'default';
    this.isLoading = false;
    this.errors = [];
    this.eventListeners = new Map();
    
    // Configuration
    this.maxHistorySize = 50;
  }

  /**
   * Initialize layer visibility state from config
   * @private
   * @returns {Object} Layer visibility state
   */
  _initializeLayerVisibility() {
    const visibility = {};
    for (const [layerId, config] of Object.entries(layerConfig)) {
      visibility[layerId] = config.defaultVisible;
    }
    return visibility;
  }

  /**
   * Update a style property for a specific layer
   * @param {string} layerId - Layer ID
   * @param {string} property - Style property name
   * @param {*} value - Property value
   * @returns {boolean} Success status
   */
  updateStyle(layerId, property, value) {
    try {
      // Validate layer exists
      if (!this.currentStyle.layers.find(layer => layer.id === layerId)) {
        console.warn(`Layer ${layerId} not found in current style`);
        return false;
      }

      // Find and update the layer
      const layer = this.currentStyle.layers.find(l => l.id === layerId);
      if (!layer.paint) {
        layer.paint = {};
      }

      const oldValue = layer.paint[property];
      layer.paint[property] = value;

      // Push to history if this is a significant change
      this._pushToHistory();

      // Emit change event
      this.emit('styleChanged', {
        layerId,
        property,
        value,
        oldValue,
        style: this.currentStyle
      });

      return true;
    } catch (error) {
      console.error('Failed to update style:', error);
      this.emit('error', {
        type: 'styleUpdate',
        message: `Failed to update ${property} for ${layerId}`,
        error
      });
      return false;
    }
  }

  /**
   * Toggle layer visibility
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state (optional, will toggle if not provided)
   * @returns {boolean} New visibility state
   */
  toggleLayerVisibility(layerId, visible) {
    // If visible is not provided, toggle current state
    if (visible === undefined) {
      visible = !this.layerVisibility[layerId];
    }

    this.layerVisibility[layerId] = visible;

    // Update the style object
    const layer = this.currentStyle.layers.find(l => l.id === layerId);
    if (layer) {
      if (!layer.layout) {
        layer.layout = {};
      }
      layer.layout.visibility = visible ? 'visible' : 'none';
    }

    this.emit('layerVisibilityChanged', {
      layerId,
      visible,
      layerVisibility: { ...this.layerVisibility }
    });

    return visible;
  }

  /**
   * Apply a theme to the current style
   * @param {string} themeName - Theme name
   * @param {Object} themeData - Theme configuration
   * @returns {Promise<boolean>} Success status
   */
  async applyTheme(themeName, themeData) {
    try {
      this.isLoading = true;
      this.emit('loadingChanged', { isLoading: true });

      // Store previous theme for potential rollback
      const previousTheme = this.activeTheme;
      const previousStyle = deepClone(this.currentStyle);

      // Apply theme changes to current style
      if (themeData.layers) {
        for (const [layerId, layerChanges] of Object.entries(themeData.layers)) {
          const layer = this.currentStyle.layers.find(l => l.id === layerId);
          if (layer && layerChanges.paint) {
            layer.paint = { ...layer.paint, ...layerChanges.paint };
          }
        }
      }

      // Update background if provided
      if (themeData.background) {
        const backgroundLayer = this.currentStyle.layers.find(l => l.id === 'background');
        if (backgroundLayer) {
          backgroundLayer.paint = { ...backgroundLayer.paint, ...themeData.background };
        }
      }

      this.activeTheme = themeName;
      this._pushToHistory();

      this.emit('themeChanged', {
        themeName,
        previousTheme,
        style: this.currentStyle
      });

      return true;
    } catch (error) {
      console.error('Failed to apply theme:', error);
      this.emit('error', {
        type: 'themeChange',
        message: `Failed to apply theme: ${themeName}`,
        error
      });
      return false;
    } finally {
      this.isLoading = false;
      this.emit('loadingChanged', { isLoading: false });
    }
  }

  /**
   * Get current style object (deep clone for safety)
   * @returns {Object} Current MapLibre style
   */
  getCurrentStyle() {
    return deepClone(this.currentStyle);
  }

  /**
   * Get layer configuration
   * @param {string} layerId - Layer ID (optional)
   * @returns {Object} Layer configuration
   */
  getLayerConfig(layerId) {
    if (layerId) {
      return layerConfig[layerId] || null;
    }
    return layerConfig;
  }

  /**
   * Push current state to history
   * @private
   */
  _pushToHistory() {
    // Remove any future history if we're not at the end
    if (this.historyIndex < this.styleHistory.length - 1) {
      this.styleHistory = this.styleHistory.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.styleHistory.push(deepClone(this.currentStyle));
    this.historyIndex = this.styleHistory.length - 1;

    // Limit history size
    if (this.styleHistory.length > this.maxHistorySize) {
      this.styleHistory.shift();
      this.historyIndex--;
    }

    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historyLength: this.styleHistory.length
    });
  }

  /**
   * Undo last change
   * @returns {boolean} Success status
   */
  undo() {
    if (!this.canUndo()) {
      return false;
    }

    this.historyIndex--;
    this.currentStyle = deepClone(this.styleHistory[this.historyIndex]);

    this.emit('styleChanged', {
      type: 'undo',
      style: this.currentStyle
    });

    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historyLength: this.styleHistory.length
    });

    return true;
  }

  /**
   * Redo last undone change
   * @returns {boolean} Success status
   */
  redo() {
    if (!this.canRedo()) {
      return false;
    }

    this.historyIndex++;
    this.currentStyle = deepClone(this.styleHistory[this.historyIndex]);

    this.emit('styleChanged', {
      type: 'redo',
      style: this.currentStyle
    });

    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historyLength: this.styleHistory.length
    });

    return true;
  }

  /**
   * Check if undo is available
   * @returns {boolean} Can undo
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean} Can redo
   */
  canRedo() {
    return this.historyIndex < this.styleHistory.length - 1;
  }

  /**
   * Reset to default style
   */
  resetToDefault() {
    this.currentStyle = deepClone(defaultStyle);
    this.layerVisibility = this._initializeLayerVisibility();
    this.activeTheme = 'default';
    this._pushToHistory();

    this.emit('styleReset', {
      style: this.currentStyle,
      layerVisibility: this.layerVisibility
    });
  }

  /**
   * Add error to error queue
   * @param {Object} error - Error object
   */
  addError(error) {
    this.errors.push({
      ...error,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });

    this.emit('errorAdded', error);
  }

  /**
   * Remove error from queue
   * @param {string} errorId - Error ID
   */
  removeError(errorId) {
    const index = this.errors.findIndex(error => error.id === errorId);
    if (index > -1) {
      const removedError = this.errors.splice(index, 1)[0];
      this.emit('errorRemoved', removedError);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    this.emit('errorsCleared');
  }

  /**
   * Event system methods
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    
    this.eventListeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Get current application state summary
   * @returns {Object} State summary
   */
  getStateSummary() {
    return {
      activeTheme: this.activeTheme,
      layerVisibility: { ...this.layerVisibility },
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      isLoading: this.isLoading,
      errorCount: this.errors.length
    };
  }
}