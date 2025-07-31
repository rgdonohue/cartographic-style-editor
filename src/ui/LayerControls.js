/**
 * LayerControls - UI component for layer visibility toggles
 * Creates and manages checkboxes for each layer
 */

import { generateId } from '../utils/helpers.js';

export class LayerControls {
  /**
   * Initialize LayerControls
   * @param {HTMLElement} container - Container element
   * @param {AppState} appState - Application state instance
   * @param {MapController} mapController - Map controller instance
   */
  constructor(container, appState, mapController) {
    this.container = container;
    this.appState = appState;
    this.mapController = mapController;
    this.controls = new Map();
    
    this._setupEventListeners();
    this._render();
  }

  /**
   * Setup event listeners for state changes
   * @private
   */
  _setupEventListeners() {
    // Listen for layer visibility changes
    this.appState.on('layerVisibilityChanged', (data) => {
      this._updateControlState(data.layerId, data.visible);
    });

    // Listen for style resets
    this.appState.on('styleReset', () => {
      this._updateAllControls();
    });
  }

  /**
   * Render layer controls
   * @private
   */
  _render() {
    // Clear existing controls
    this.container.innerHTML = '';
    this.controls.clear();

    const layerConfig = this.appState.getLayerConfig();

    // Create controls for each layer
    for (const [layerId, config] of Object.entries(layerConfig)) {
      const controlElement = this._createLayerControl(layerId, config);
      this.container.appendChild(controlElement);
    }
  }

  /**
   * Create a single layer control
   * @private
   * @param {string} layerId - Layer ID
   * @param {Object} config - Layer configuration
   * @returns {HTMLElement} Control element
   */
  _createLayerControl(layerId, config) {
    const controlId = generateId(`layer-control-${layerId}`);
    const isVisible = this.appState.layerVisibility[layerId];

    // Create container
    const container = document.createElement('div');
    container.className = 'layer-control';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-labelledby', `${controlId}-label`);

    // Create label
    const label = document.createElement('label');
    label.id = `${controlId}-label`;
    label.textContent = config.name;
    label.htmlFor = controlId;

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = controlId;
    checkbox.checked = isVisible;
    checkbox.setAttribute('aria-describedby', `${controlId}-desc`);

    // Add accessibility description
    const description = document.createElement('span');
    description.id = `${controlId}-desc`;
    description.className = 'sr-only'; // Screen reader only
    description.textContent = `Toggle visibility of ${config.name} layer`;

    // Add event listener
    checkbox.addEventListener('change', (e) => {
      this._handleVisibilityChange(layerId, e.target.checked);
    });

    // Store reference
    this.controls.set(layerId, {
      container,
      checkbox,
      label
    });

    // Assemble control
    container.appendChild(label);
    container.appendChild(checkbox);
    container.appendChild(description);

    return container;
  }

  /**
   * Handle visibility change event
   * @private
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - New visibility state
   */
  _handleVisibilityChange(layerId, visible) {
    try {
      // Update app state
      this.appState.toggleLayerVisibility(layerId, visible);
      
      // Update map
      this.mapController.toggleLayerVisibility(layerId, visible);

      // Update control appearance
      this._updateControlAppearance(layerId, visible);

    } catch (error) {
      console.error(`Failed to toggle layer visibility for ${layerId}:`, error);
      
      // Revert checkbox state on error
      const control = this.controls.get(layerId);
      if (control) {
        control.checkbox.checked = !visible;
      }

      // Emit error
      this.appState.addError({
        type: 'layerVisibility',
        message: `Failed to toggle ${layerId} layer`,
        error
      });
    }
  }

  /**
   * Update control state for a specific layer
   * @private
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state
   */
  _updateControlState(layerId, visible) {
    const control = this.controls.get(layerId);
    if (control && control.checkbox.checked !== visible) {
      control.checkbox.checked = visible;
      this._updateControlAppearance(layerId, visible);
    }
  }

  /**
   * Update control visual appearance
   * @private
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state
   */
  _updateControlAppearance(layerId, visible) {
    const control = this.controls.get(layerId);
    if (!control) return;

    // Add visual feedback for disabled layers
    if (visible) {
      control.container.classList.remove('layer-disabled');
      control.label.style.opacity = '1';
    } else {
      control.container.classList.add('layer-disabled');
      control.label.style.opacity = '0.6';
    }
  }

  /**
   * Update all controls to match current state
   * @private
   */
  _updateAllControls() {
    for (const [layerId, visible] of Object.entries(this.appState.layerVisibility)) {
      this._updateControlState(layerId, visible);
    }
  }

  /**
   * Get current layer visibility state
   * @returns {Object} Layer visibility state
   */
  getLayerVisibility() {
    const visibility = {};
    for (const [layerId, control] of this.controls) {
      visibility[layerId] = control.checkbox.checked;
    }
    return visibility;
  }

  /**
   * Set layer visibility programmatically
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state
   */
  setLayerVisibility(layerId, visible) {
    const control = this.controls.get(layerId);
    if (control) {
      control.checkbox.checked = visible;
      this._handleVisibilityChange(layerId, visible);
    }
  }

  /**
   * Enable/disable all controls
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    for (const [layerId, control] of this.controls) {
      control.checkbox.disabled = !enabled;
      control.container.classList.toggle('disabled', !enabled);
    }
  }

  /**
   * Destroy the component and cleanup
   */
  destroy() {
    // Remove event listeners
    this.appState.off('layerVisibilityChanged', this._updateControlState);
    this.appState.off('styleReset', this._updateAllControls);

    // Clear DOM
    this.container.innerHTML = '';
    this.controls.clear();
  }
}