/**
 * ExportControls - Style and image export functionality
 * Handles JSON style export and PNG map export with error handling
 */

import { downloadBlob } from '../utils/helpers.js';

export class ExportControls {
  /**
   * Initialize ExportControls
   * @param {AppState} appState - Application state instance
   * @param {MapController} mapController - Map controller instance
   */
  constructor(appState, mapController) {
    this.appState = appState;
    this.mapController = mapController;
    this.isExporting = false;
  }

  /**
   * Export current style as JSON file
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  async exportStyleJSON(options = {}) {
    if (this.isExporting) {
      return { 
        success: false, 
        error: 'Export already in progress' 
      };
    }

    try {
      this.isExporting = true;
      this.appState.emit('exportStarted', { type: 'json' });

      // Get current style
      const style = this.appState.getCurrentStyle();
      
      // Validate style object
      const validationResult = this._validateStyleObject(style);
      if (!validationResult.isValid) {
        throw new Error(`Invalid style: ${validationResult.errors.join(', ')}`);
      }

      // Add metadata
      const exportData = {
        ...style,
        metadata: {
          ...style.metadata,
          'map-remix': {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            activeTheme: this.appState.activeTheme,
            layerVisibility: { ...this.appState.layerVisibility }
          }
        }
      };

      // Create blob and download
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const filename = options.filename || this._generateFilename('style', 'json');
      downloadBlob(blob, filename);

      this.appState.emit('exportCompleted', { 
        type: 'json', 
        filename,
        size: blob.size 
      });

      return { 
        success: true, 
        filename, 
        size: blob.size 
      };

    } catch (error) {
      console.error('Failed to export JSON:', error);
      
      // Offer fallback: display JSON in new window
      try {
        const style = this.appState.getCurrentStyle();
        const jsonString = JSON.stringify(style, null, 2);
        this._showJSONFallback(jsonString);
        
        this.appState.emit('exportCompleted', { 
          type: 'json-fallback',
          message: 'JSON displayed in new window due to download issue'
        });

        return { 
          success: true, 
          fallback: true,
          message: 'JSON displayed in new window'
        };
      } catch (fallbackError) {
        this.appState.addError({
          type: 'export',
          message: 'Failed to export style JSON',
          error
        });

        return { 
          success: false, 
          error: error.message 
        };
      }
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export current map view as PNG image
   * @param {Object} options - Export options (width, height, quality)
   * @returns {Promise<Object>} Export result
   */
  async exportPNG(options = {}) {
    if (this.isExporting) {
      return { 
        success: false, 
        error: 'Export already in progress' 
      };
    }

    try {
      this.isExporting = true;
      this.appState.emit('exportStarted', { type: 'png' });

      const defaultOptions = { 
        width: 1024, 
        height: 768, 
        quality: 0.92 
      };
      const exportOptions = { ...defaultOptions, ...options };

      // Export from map controller
      const blob = await this.mapController.exportPNG(exportOptions);
      
      if (!blob) {
        throw new Error('Failed to generate PNG blob');
      }

      const filename = options.filename || this._generateFilename('map-export', 'png');
      downloadBlob(blob, filename);

      this.appState.emit('exportCompleted', { 
        type: 'png', 
        filename,
        size: blob.size,
        dimensions: {
          width: exportOptions.width,
          height: exportOptions.height
        }
      });

      return { 
        success: true, 
        filename, 
        size: blob.size,
        dimensions: {
          width: exportOptions.width,
          height: exportOptions.height
        }
      };

    } catch (error) {
      console.error('Failed to export PNG:', error);
      
      this.appState.addError({
        type: 'export',
        message: 'Failed to export map image',
        error
      });

      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Import style from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} Import result
   */
  async importStyleJSON(file) {
    try {
      this.appState.emit('importStarted', { type: 'json' });

      // Read file content
      const text = await this._readFileAsText(file);
      
      let styleData;
      try {
        styleData = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON file');
      }

      // Validate imported style
      const validationResult = this._validateStyleObject(styleData);
      if (!validationResult.isValid) {
        throw new Error(`Invalid style format: ${validationResult.errors.join(', ')}`);
      }

      // Apply imported style
      this.appState.currentStyle = styleData;
      
      // Restore layer visibility if available
      if (styleData.metadata?.['map-remix']?.layerVisibility) {
        this.appState.layerVisibility = { 
          ...this.appState.layerVisibility, 
          ...styleData.metadata['map-remix'].layerVisibility 
        };
      }

      // Update theme if available
      if (styleData.metadata?.['map-remix']?.activeTheme) {
        this.appState.activeTheme = styleData.metadata['map-remix'].activeTheme;
      }

      // Push to history
      this.appState._pushToHistory();

      // Update map
      this.mapController.updateStyle(styleData);

      this.appState.emit('importCompleted', { 
        type: 'json',
        filename: file.name
      });

      return { 
        success: true, 
        filename: file.name 
      };

    } catch (error) {
      console.error('Failed to import JSON:', error);
      
      this.appState.addError({
        type: 'import',
        message: 'Failed to import style JSON',
        error
      });

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Validate MapLibre style object
   * @private
   * @param {Object} style - Style object to validate
   * @returns {Object} Validation result
   */
  _validateStyleObject(style) {
    const errors = [];

    // Check required properties
    if (!style.version) {
      errors.push('Missing version property');
    }

    if (!style.sources) {
      errors.push('Missing sources property');
    }

    if (!style.layers || !Array.isArray(style.layers)) {
      errors.push('Missing or invalid layers property');
    }

    // Check layer structure
    if (style.layers) {
      style.layers.forEach((layer, index) => {
        if (!layer.id) {
          errors.push(`Layer ${index} missing id`);
        }
        if (!layer.type) {
          errors.push(`Layer ${layer.id || index} missing type`);
        }
      });
    }

    // Check for PMTiles sources
    if (style.sources) {
      const pmtilesCount = Object.values(style.sources)
        .filter(source => source.url && source.url.startsWith('pmtiles://'))
        .length;
      
      if (pmtilesCount === 0) {
        errors.push('No PMTiles sources found - style may not work correctly');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate filename with timestamp
   * @private
   * @param {string} basename - Base filename
   * @param {string} extension - File extension
   * @returns {string} Generated filename
   */
  _generateFilename(basename, extension) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5); // Remove milliseconds and Z
    
    return `map-remix-${basename}-${timestamp}.${extension}`;
  }

  /**
   * Show JSON in fallback window
   * @private
   * @param {string} jsonString - JSON string to display
   */
  _showJSONFallback(jsonString) {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Map Remix Style Export</title>
            <style>
              body { 
                font-family: monospace; 
                margin: 20px; 
                background: #f5f5f5;
              }
              pre { 
                background: white; 
                padding: 20px; 
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: auto;
              }
              h1 { color: #333; }
              .instructions {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Map Remix Style Export</h1>
            <div class="instructions">
              <strong>Instructions:</strong> Select all text below (Ctrl+A / Cmd+A) and copy (Ctrl+C / Cmd+C) to save this style.
            </div>
            <pre>${jsonString}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  /**
   * Read file as text
   * @private
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  _readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Check if export is in progress
   * @returns {boolean} Export status
   */
  isExportInProgress() {
    return this.isExporting;
  }
}