/**
 * StyleControls - UI component for style editing (color, width, opacity)
 * Creates and manages color pickers, sliders, and inputs for style properties
 */

import { generateId, isValidHexColor, supportsFeature, formatNumber } from '../utils/helpers.js';
import { debounce } from '../utils/debounce.js';

export class StyleControls {
  /**
   * Initialize StyleControls
   * @param {HTMLElement} container - Container element
   * @param {AppState} appState - Application state instance
   * @param {MapController} mapController - Map controller instance
   */
  constructor(container, appState, mapController) {
    this.container = container;
    this.appState = appState;
    this.mapController = mapController;
    this.controls = new Map();
    this.debounceTimeouts = new Map();
    this.supportsColorInput = supportsFeature('colorInput');
    
    // Debounced update function
    this.debouncedUpdate = debounce(this._updateMapStyle.bind(this), 100);
    
    this._setupEventListeners();
    this._render();
  }

  /**
   * Setup event listeners for state changes
   * @private
   */
  _setupEventListeners() {
    // Listen for style changes from other sources
    this.appState.on('styleChanged', (data) => {
      if (data.type !== 'userInput') {
        this._updateControlValues();
      }
    });

    // Listen for style resets
    this.appState.on('styleReset', () => {
      this._updateControlValues();
    });

    // Listen for theme changes
    this.appState.on('themeChanged', () => {
      this._updateControlValues();
    });
  }

  /**
   * Render style controls for all layers
   * @private
   */
  _render() {
    // Clear existing controls
    this.container.innerHTML = '';
    this.controls.clear();

    const layerConfig = this.appState.getLayerConfig();
    const currentStyle = this.appState.getCurrentStyle();

    // Create controls for each layer
    for (const [layerId, config] of Object.entries(layerConfig)) {
      const layer = currentStyle.layers.find(l => l.id === layerId);
      if (layer) {
        const controlSection = this._createLayerControls(layerId, config, layer);
        this.container.appendChild(controlSection);
      }
    }
  }

  /**
   * Create controls for a single layer
   * @private
   * @param {string} layerId - Layer ID
   * @param {Object} config - Layer configuration
   * @param {Object} layer - Layer style object
   * @returns {HTMLElement} Control section element
   */
  _createLayerControls(layerId, config, layer) {
    const section = document.createElement('div');
    section.className = 'style-control';
    section.setAttribute('data-layer', layerId);

    // Create section header
    const header = document.createElement('h4');
    header.textContent = config.name;
    header.style.marginBottom = '0.5rem';
    section.appendChild(header);

    // Create controls for each style property
    const layerControls = new Map();
    
    for (const property of config.styleProperties) {
      const currentValue = layer.paint?.[property];
      if (currentValue !== undefined) {
        const control = this._createPropertyControl(layerId, property, currentValue, config.type);
        if (control) {
          section.appendChild(control.element);
          layerControls.set(property, control);
        }
      }
    }

    this.controls.set(layerId, layerControls);
    return section;
  }

  /**
   * Create control for a single property
   * @private
   * @param {string} layerId - Layer ID
   * @param {string} property - Property name
   * @param {*} currentValue - Current property value
   * @param {string} layerType - Layer type (line, circle, etc.)
   * @returns {Object} Control object with element and update method
   */
  _createPropertyControl(layerId, property, currentValue, layerType) {
    if (property.includes('color')) {
      return this._createColorControl(layerId, property, currentValue);
    } else if (property.includes('width') || property.includes('radius')) {
      return this._createSliderControl(layerId, property, currentValue, 1, 10, 'px');
    } else if (property.includes('opacity')) {
      return this._createSliderControl(layerId, property, currentValue, 0, 1, '');
    }
    
    return null;
  }

  /**
   * Create color picker control
   * @private
   * @param {string} layerId - Layer ID
   * @param {string} property - Property name
   * @param {string} currentValue - Current color value
   * @returns {Object} Control object
   */
  _createColorControl(layerId, property, currentValue) {
    const controlId = generateId(`color-control-${layerId}-${property}`);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'control-group';

    // Create label
    const label = document.createElement('label');
    label.htmlFor = controlId;
    label.textContent = this._formatPropertyName(property);

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '0.5rem';
    inputContainer.style.alignItems = 'center';

    let primaryInput, fallbackInput;

    if (this.supportsColorInput) {
      // Native color picker
      primaryInput = document.createElement('input');
      primaryInput.type = 'color';
      primaryInput.id = controlId;
      primaryInput.value = currentValue;
      primaryInput.setAttribute('aria-label', `${this._formatPropertyName(property)} color picker`);

      // Text input fallback (always show for accessibility)
      fallbackInput = document.createElement('input');
      fallbackInput.type = 'text';
      fallbackInput.value = currentValue;
      fallbackInput.placeholder = '#000000';
      fallbackInput.style.width = '80px';
      fallbackInput.style.fontFamily = 'monospace';
      fallbackInput.setAttribute('aria-label', `${this._formatPropertyName(property)} hex color`);
      fallbackInput.pattern = '^#[0-9A-Fa-f]{6}$';

    } else {
      // Text input only (Safari fallback)
      primaryInput = document.createElement('input');
      primaryInput.type = 'text';
      primaryInput.id = controlId;
      primaryInput.value = currentValue;
      primaryInput.placeholder = '#000000';
      primaryInput.style.width = '100px';
      primaryInput.style.fontFamily = 'monospace';
      primaryInput.setAttribute('aria-label', `${this._formatPropertyName(property)} hex color`);
      primaryInput.pattern = '^#[0-9A-Fa-f]{6}$';
    }

    // Add event listeners
    const handleChange = (value) => {
      if (isValidHexColor(value)) {
        this._handleStyleChange(layerId, property, value);
        
        // Sync inputs
        if (primaryInput && primaryInput.value !== value) {
          primaryInput.value = value;
        }
        if (fallbackInput && fallbackInput.value !== value) {
          fallbackInput.value = value;
        }
      }
    };

    primaryInput.addEventListener('change', (e) => handleChange(e.target.value));
    
    if (fallbackInput) {
      fallbackInput.addEventListener('change', (e) => handleChange(e.target.value));
      fallbackInput.addEventListener('blur', (e) => handleChange(e.target.value));
    }

    // Assemble control
    container.appendChild(label);
    inputContainer.appendChild(primaryInput);
    if (fallbackInput) {
      inputContainer.appendChild(fallbackInput);
    }
    container.appendChild(inputContainer);

    return {
      element: container,
      update: (value) => {
        primaryInput.value = value;
        if (fallbackInput) {
          fallbackInput.value = value;
        }
      }
    };
  }

  /**
   * Create slider control
   * @private
   * @param {string} layerId - Layer ID
   * @param {string} property - Property name
   * @param {number} currentValue - Current value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} unit - Unit suffix
   * @returns {Object} Control object
   */
  _createSliderControl(layerId, property, currentValue, min, max, unit) {
    const controlId = generateId(`slider-control-${layerId}-${property}`);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'control-group';

    // Create label
    const label = document.createElement('label');
    label.htmlFor = controlId;
    label.textContent = this._formatPropertyName(property);

    // Create slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = controlId;
    slider.min = min;
    slider.max = max;
    slider.step = property.includes('opacity') ? 0.1 : 1;
    slider.value = currentValue;
    slider.setAttribute('aria-label', `${this._formatPropertyName(property)} slider`);

    // Create value display
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'value-display';
    valueDisplay.textContent = formatNumber(currentValue) + unit;
    valueDisplay.setAttribute('aria-live', 'polite');

    // Add event listeners
    const handleInput = (value) => {
      const numValue = parseFloat(value);
      valueDisplay.textContent = formatNumber(numValue) + unit;
      this._handleStyleChange(layerId, property, numValue);
    };

    slider.addEventListener('input', (e) => handleInput(e.target.value));

    // Assemble control
    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueDisplay);

    return {
      element: container,
      update: (value) => {
        slider.value = value;
        valueDisplay.textContent = formatNumber(value) + unit;
      }
    };
  }

  /**
   * Handle style property change
   * @private
   * @param {string} layerId - Layer ID
   * @param {string} property - Property name
   * @param {*} value - New value
   */
  _handleStyleChange(layerId, property, value) {
    try {
      // Update app state
      this.appState.updateStyle(layerId, property, value);
      
      // Update map with debouncing
      this.debouncedUpdate(layerId, property, value);

    } catch (error) {
      console.error(`Failed to update ${property} for ${layerId}:`, error);
      this.appState.addError({
        type: 'styleUpdate',
        message: `Failed to update ${this._formatPropertyName(property)}`,
        error
      });
    }
  }

  /**
   * Update map style (debounced)
   * @private
   * @param {string} layerId - Layer ID
   * @param {string} property - Property name
   * @param {*} value - New value
   */
  _updateMapStyle(layerId, property, value) {
    this.mapController.updatePaintProperty(layerId, property, value);
  }

  /**
   * Update control values from current style
   * @private
   */
  _updateControlValues() {
    const currentStyle = this.appState.getCurrentStyle();
    
    for (const [layerId, layerControls] of this.controls) {
      const layer = currentStyle.layers.find(l => l.id === layerId);
      if (layer && layer.paint) {
        for (const [property, control] of layerControls) {
          const value = layer.paint[property];
          if (value !== undefined) {
            control.update(value);
          }
        }
      }
    }
  }

  /**
   * Format property name for display
   * @private
   * @param {string} property - Property name
   * @returns {string} Formatted name
   */
  _formatPropertyName(property) {
    return property
      .replace(/^(line-|circle-)/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Enable/disable all controls
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    const inputs = this.container.querySelectorAll('input');
    inputs.forEach(input => {
      input.disabled = !enabled;
    });
  }

  /**
   * Destroy the component and cleanup
   */
  destroy() {
    // Clear debounce timeouts
    for (const [key, timeoutId] of this.debounceTimeouts) {
      clearTimeout(timeoutId);
    }
    this.debounceTimeouts.clear();

    // Remove event listeners
    this.appState.off('styleChanged', this._updateControlValues);
    this.appState.off('styleReset', this._updateControlValues);
    this.appState.off('themeChanged', this._updateControlValues);

    // Clear DOM
    this.container.innerHTML = '';
    this.controls.clear();
  }
}