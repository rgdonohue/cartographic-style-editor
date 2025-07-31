/**
 * MapController - Primary interface to MapLibre GL JS instance
 * Handles map initialization, PMTiles loading, and style updates
 */

import { defaultStyle } from '../styles/defaultStyle.js';
import { debounce } from '../utils/debounce.js';
import { supportsFeature } from '../utils/helpers.js';

export class MapController {
  /**
   * Initialize MapController
   * @param {string} containerId - DOM element ID for map container
   * @param {Object} initialStyle - Initial MapLibre style object
   */
  constructor(containerId, initialStyle = defaultStyle) {
    this.containerId = containerId;
    this.map = null;
    this.pmtilesProtocol = null;
    this.loadingTiles = new Set();
    this.eventListeners = new Map();
    this.initialStyle = initialStyle;
    
    // Debounced style update function
    this.debouncedStyleUpdate = debounce(this._updateStyleInternal.bind(this), 100);
  }

  /**
   * Initialize the map with PMTiles protocol
   * @param {Object} options - Map initialization options
   * @returns {Promise<void>}
   */
  async initializeMap(options = {}) {
    try {
      // Check WebGL support
      if (!supportsFeature('webgl')) {
        throw new Error('WebGL is not supported in this browser. Map Remix requires WebGL for vector tile rendering.');
      }

      // Set up PMTiles protocol
      this._setupPMTilesProtocol();

      // Initialize MapLibre map
      this.map = new maplibregl.Map({
        container: this.containerId,
        style: this.initialStyle,
        center: this.initialStyle.center || [-105.7821, 39.7391],
        zoom: this.initialStyle.zoom || 7,
        bearing: this.initialStyle.bearing || 0,
        pitch: this.initialStyle.pitch || 0,
        maxZoom: 15,
        minZoom: 5,
        ...options
      });

      // Set up event listeners
      this._setupEventListeners();

      // Wait for map to load
      await new Promise((resolve, reject) => {
        this.map.on('load', resolve);
        this.map.on('error', reject);
      });

      this.emit('mapInitialized', { map: this.map });
      console.log('Map initialized successfully');

    } catch (error) {
      console.error('Failed to initialize map:', error);
      this.emit('error', { 
        type: 'mapInitialization', 
        message: error.message, 
        error 
      });
      throw error;
    }
  }

  /**
   * Update map style with debouncing
   * @param {Object} newStyle - New MapLibre style object
   * @param {Object} options - Update options
   */
  updateStyle(newStyle, options = {}) {
    if (!this.map) {
      console.warn('Cannot update style: map not initialized');
      return;
    }

    this.debouncedStyleUpdate(newStyle, options);
  }

  /**
   * Update a single paint property (immediate, no debouncing)
   * @param {string} layerId - Layer ID
   * @param {string} property - Paint property name
   * @param {*} value - Property value
   */
  updatePaintProperty(layerId, property, value) {
    if (!this.map) {
      console.warn('Cannot update paint property: map not initialized');
      return;
    }

    try {
      this.map.setPaintProperty(layerId, property, value);
      this.emit('styleUpdated', { layerId, property, value });
    } catch (error) {
      console.error(`Failed to update paint property ${property} for layer ${layerId}:`, error);
      this.emit('error', {
        type: 'styleUpdate',
        message: `Failed to update ${property}`,
        error
      });
    }
  }

  /**
   * Toggle layer visibility
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state
   */
  toggleLayerVisibility(layerId, visible) {
    if (!this.map) {
      console.warn('Cannot toggle layer visibility: map not initialized');
      return;
    }

    try {
      this.map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      this.emit('layerVisibilityChanged', { layerId, visible });
    } catch (error) {
      console.error(`Failed to toggle visibility for layer ${layerId}:`, error);
      this.emit('error', {
        type: 'layerVisibility',
        message: `Failed to toggle layer ${layerId}`,
        error
      });
    }
  }

  /**
   * Export current map as PNG
   * @param {Object} options - Export options (width, height, quality)
   * @returns {Promise<Blob>} PNG blob
   */
  async exportPNG(options = {}) {
    if (!this.map) {
      throw new Error('Cannot export PNG: map not initialized');
    }

    const defaultOptions = { 
      width: 1024, 
      height: 768, 
      quality: 0.92 
    };
    const exportOptions = { ...defaultOptions, ...options };

    try {
      return new Promise((resolve, reject) => {
        // Wait for map to finish rendering
        this.map.once('idle', () => {
          try {
            const canvas = this.map.getCanvas();
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create PNG blob'));
              }
            }, 'image/png', exportOptions.quality);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to export PNG:', error);
      this.emit('error', {
        type: 'export',
        message: 'Failed to export PNG',
        error
      });
      throw error;
    }
  }

  /**
   * Get current map center and zoom
   * @returns {Object} Current view state
   */
  getViewState() {
    if (!this.map) return null;

    return {
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch()
    };
  }

  /**
   * Get current style object
   * @returns {Object} Current MapLibre style
   */
  getCurrentStyle() {
    if (!this.map) return null;
    return this.map.getStyle();
  }

  /**
   * Setup PMTiles protocol
   * @private
   */
  _setupPMTilesProtocol() {
    try {
      this.pmtilesProtocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', this.pmtilesProtocol.tile);
      console.log('PMTiles protocol registered successfully');
    } catch (error) {
      console.error('Failed to setup PMTiles protocol:', error);
      throw new Error('Failed to initialize PMTiles support');
    }
  }

  /**
   * Setup map event listeners
   * @private
   */
  _setupEventListeners() {
    // Tile loading events
    this.map.on('sourcedata', this._handleSourceData.bind(this));
    this.map.on('error', this._handleMapError.bind(this));
    
    // Map interaction events
    this.map.on('moveend', () => {
      this.emit('viewChanged', this.getViewState());
    });
  }

  /**
   * Handle source data events (tile loading)
   * @private
   */
  _handleSourceData(e) {
    if (e.sourceId && e.isSourceLoaded) {
      this.loadingTiles.delete(e.sourceId);
      this.emit('tilesLoaded', { sourceId: e.sourceId });
    }
  }

  /**
   * Handle map errors
   * @private
   */
  _handleMapError(error) {
    console.error('Map error:', error);
    this.emit('error', {
      type: 'mapError',
      message: error.error?.message || 'Map rendering error',
      error: error.error
    });
  }

  /**
   * Internal style update method
   * @private
   */
  _updateStyleInternal(newStyle, options) {
    try {
      this.map.setStyle(newStyle, options);
      this.emit('styleUpdated', { style: newStyle });
    } catch (error) {
      console.error('Failed to update map style:', error);
      this.emit('error', {
        type: 'styleUpdate',
        message: 'Failed to update map style',
        error
      });
    }
  }

  /**
   * Event emitter functionality
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
   * Cleanup resources
   */
  cleanup() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (this.pmtilesProtocol) {
      maplibregl.removeProtocol('pmtiles');
      this.pmtilesProtocol = null;
    }

    this.eventListeners.clear();
    this.loadingTiles.clear();
  }
}