# Software Design Document (SDD)

## Project Title: **Map Remix – A Live Cartographic Style Editor**

---

## 🧱 System Overview

Map Remix is a lightweight, browser-based application built with Vanilla JavaScript and MapLibre GL JS, designed to allow users to interactively style vector tile maps of Colorado infrastructure data (roads, rivers, rails, and selected POIs). The app is fully client-side, requiring no server backend, and supports PMTiles for efficient, offline-capable tile loading.

The architecture is modular and agent-compatible to enable AI-assisted development and extensibility.

---

## 🏗️ Architecture Overview

### File Structure
```
/public/
  |- index.html
  |- styles.css
  |- manifest.json        # PWA manifest
/src/
  |- main.js             # Entry point and app initialization
  |- state/              # Application state management
      |- AppState.js     # Central state store
      |- StyleManager.js # Style object manipulation
  |- map/                # MapLibre setup and PMTiles loading
      |- MapController.js
      |- TileLoader.js
      |- MapEvents.js
  |- ui/                 # UI components and event bindings
      |- LayerControls.js
      |- StyleControls.js
      |- ExportControls.js
      |- ThemeSelector.js
      |- ErrorDisplay.js
  |- styles/
      |- themes.js       # Theme presets
      |- defaultStyle.js # Default style configuration
  |- utils/
      |- helpers.js      # Utility functions
      |- validation.js   # Style validation
      |- debounce.js     # Performance utilities
/assets/
  |- tiles/*.pmtiles
  |- icons/
/tests/
  |- unit/
  |- integration/
/docs/
  |- api.md             # Module API documentation
```

### Data Flow Architecture

```
User Interaction → UI Component → AppState → StyleManager → MapController → MapLibre
     ↑                                                                           ↓
Error Display ← ErrorHandler ← ValidationLayer ← StateChange ← RenderEngine ←──┘
```

---

## 🔧 Technology Stack

### Frontend
* **Language:** JavaScript (ES2020+)
  - Features used: Optional chaining, nullish coalescing, dynamic imports
  - No build system: Direct ES module imports for simplicity
* **Map Rendering:** MapLibre GL JS v3.6+
* **Styling:** PicoCSS v2.0+ (CDN-loaded, no build required)
* **Tile Loading:** @protomaps/pmtiles v3.0+ via CDN
* **Color Picking:** Native `<input type="color">` with text input fallback
* **Export:** Canvas API for PNG export, Blob API for JSON download

### Browser Requirements
* **Minimum:** Chrome 80+, Firefox 75+, Safari 13.1+
* **Required APIs:** WebGL1+ (WebGL2 preferred), Canvas API, Blob API
* **Optional APIs:** Service Worker API for offline functionality
* **Memory:** 2GB RAM minimum, 4GB recommended for large tile sets

---

## 🗂️ State Management

### AppState.js
Central application state store managing all user interactions and map configuration.

```javascript
class AppState {
  constructor() {
    this.currentStyle = null;      // MapLibre style object
    this.layerVisibility = {};     // Layer on/off states
    this.styleHistory = [];        // Undo/redo stack
    this.activeTheme = 'default';  // Current theme name
    this.isLoading = false;        // Loading state
    this.errors = [];              // Error queue
  }

  // Core state management methods
  updateStyle(layerId, property, value) { /* ... */ }
  toggleLayerVisibility(layerId) { /* ... */ }
  applyTheme(themeName) { /* ... */ }
  pushToHistory() { /* ... */ }
  undo() { /* ... */ }
}
```

### StyleManager.js
Handles all style object manipulation and validation.

```javascript
class StyleManager {
  // Style object operations
  static cloneStyle(style) { /* Deep clone with performance optimization */ }
  static updateLayerPaint(style, layerId, property, value) { /* Immutable update */ }
  static validateStyleObject(style) { /* MapLibre spec validation */ }
  static generateStyleDiff(oldStyle, newStyle) { /* For undo/redo */ }
}
```

---

## 🧩 Core Modules

### /src/map/MapController.js

**Responsibility:** Primary interface to MapLibre GL JS instance

```javascript
class MapController {
  constructor(containerId, initialStyle) {
    this.map = null;
    this.pmtilesProtocol = null;
    this.loadingTiles = new Set();
  }

  // Core map operations
  async initializeMap(containerId, style) {
    // Initialize MapLibre with PMTiles protocol
    // Set up event listeners for tile loading
    // Configure initial view (Colorado bounds)
  }

  updateStyle(newStyle, options = {}) {
    // Debounced style updates to prevent render thrashing
    // Handle partial vs full style updates
    // Emit events for UI synchronization
  }

  exportPNG(dimensions = {width: 1024, height: 768}) {
    // Use MapLibre's built-in canvas export
    // Handle high-DPI displays
    // Return blob for download
  }

  cleanup() {
    // Remove event listeners
    // Clear PMTiles protocol
    // Destroy map instance
  }
}
```

### /src/map/TileLoader.js

**Responsibility:** PMTiles integration and tile management

```javascript
class TileLoader {
  constructor() {
    this.loadedTiles = new Map();
    this.failedTiles = new Set();
    this.retryCount = new Map();
  }

  async registerPMTilesProtocol(map) {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    
    // Set up tile loading events
    map.on('sourcedata', this.handleSourceData.bind(this));
    map.on('error', this.handleTileError.bind(this));
  }

  handleTileError(error) {
    // Implement exponential backoff retry
    // Log specific tile failures
    // Emit user-facing error events
  }

  preloadTiles(bounds, zoomLevels) {
    // Pre-cache tiles for offline use
    // Priority queue for visible tiles first
  }
}
```

### /src/ui/StyleControls.js

**Responsibility:** UI components for style editing

```javascript
class StyleControls {
  constructor(appState, mapController) {
    this.appState = appState;
    this.mapController = mapController;
    this.controls = new Map(); // DOM element references
    this.debounceTimeouts = new Map();
  }

  createColorPicker(layerId, property, currentValue) {
    // Try native color input first, fallback to text input
    // Add ARIA labels for screen readers
    // Set up debounced change handlers
    // Return DOM element with event listeners
  }

  createSlider(layerId, property, min, max, currentValue, unit = '') {
    // Create range input with live value display
    // Implement logarithmic scaling for width/opacity
    // Add keyboard navigation support
  }

  updateControlValues(style) {
    // Sync UI controls with current style state
    // Handle edge cases (missing properties, invalid values)
  }

  handleStyleChange(layerId, property, value) {
    // Debounce rapid changes (100ms delay)
    // Validate input before applying
    // Update app state and trigger map refresh
    clearTimeout(this.debounceTimeouts.get(`${layerId}-${property}`));
    this.debounceTimeouts.set(`${layerId}-${property}`, 
      setTimeout(() => {
        this.appState.updateStyle(layerId, property, value);
      }, 100)
    );
  }
}
```

### /src/ui/ExportControls.js

**Responsibility:** Style and image export functionality

```javascript
class ExportControls {
  constructor(appState, mapController) {
    this.appState = appState;
    this.mapController = mapController;
  }

  async exportStyleJSON() {
    try {
      const style = this.appState.getCurrentStyle();
      const validatedStyle = StyleManager.validateStyleObject(style);
      
      if (!validatedStyle.isValid) {
        throw new Error(`Invalid style: ${validatedStyle.errors.join(', ')}`);
      }

      const blob = new Blob([JSON.stringify(style, null, 2)], 
        { type: 'application/json' });
      this.downloadBlob(blob, 'map-remix-style.json');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exportPNG(options = {}) {
    try {
      const defaultOptions = { width: 1024, height: 768, quality: 0.92 };
      const exportOptions = { ...defaultOptions, ...options };
      
      const blob = await this.mapController.exportPNG(exportOptions);
      this.downloadBlob(blob, 'map-remix-export.png');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

---

## 📊 Performance Optimization

### Rendering Performance
* **Debouncing:** 100ms delay on style changes to prevent render thrashing
* **Differential Updates:** Use `setPaintProperty()` for single property changes, `setStyle()` only for major changes
* **Animation Frame Batching:** Group multiple style updates into single render cycle
* **Memory Management:** Implement style object pooling for undo/redo operations

### Tile Loading Optimization
```javascript
// Tile loading strategy
const TILE_LOADING_CONFIG = {
  maxConcurrentRequests: 6,
  retryAttempts: 3,
  retryDelay: [500, 1500, 5000], // Exponential backoff
  preloadRadius: 1, // Tiles around visible area
  cacheSize: 50, // Max tiles in memory (realistic for 300MB target)
  fallbackToCache: true // Use cached tiles when network fails
};
```

### Bundle Size Optimization
* **No Build Step:** Direct ES module imports keep things simple
* **CDN Dependencies:** MapLibre, PMTiles, PicoCSS loaded via CDN
* **Asset Optimization:** PMTiles hosted on GitHub LFS, compressed
* **Service Worker:** Optional cache-first strategy for offline capability

---

## 🚨 Error Handling Strategy

### Error Categories and Responses

| Error Type | Detection Method | User Response | Recovery Action |
|------------|------------------|---------------|-----------------|
| **Tile Load Failure** | `map.on('error')` | "Map tiles failed to load" + retry button | Exponential backoff retry, fallback to cached tiles |
| **Invalid Style JSON** | `StyleManager.validate()` | Specific validation error + highlight field | Revert to last valid state, suggest corrections |
| **Export Failure** | Try/catch in export functions | "Export failed" + text alternative | Offer JSON text preview, fallback export method |
| **WebGL Not Available** | Feature detection | "Using compatibility mode" | Fall back to canvas rendering if possible |
| **Color Picker Unsupported** | Feature detection | Text input automatically shown | Hex color input with validation |
| **Network Offline** | `navigator.onLine` | "Offline mode" indicator | Use cached tiles, disable import features |

### Error Display Component
```javascript
class ErrorDisplay {
  static showError(error) {
    // Create dismissible toast notification
    // Log to console for debugging
    // Track error frequency for monitoring
  }

  static showRecoverableError(error, retryCallback) {
    // Show error with retry button
    // Implement retry logic with backoff
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest + DOM Testing Library)
```javascript
// Example test structure
describe('StyleManager', () => {
  test('should validate valid MapLibre style object', () => {
    const validStyle = createTestStyle();
    const result = StyleManager.validateStyleObject(validStyle);
    expect(result.isValid).toBe(true);
  });

  test('should detect invalid paint properties', () => {
    const invalidStyle = createTestStyleWithInvalidColor();
    const result = StyleManager.validateStyleObject(invalidStyle);
    expect(result.errors).toContain('Invalid color value');
  });
});
```

### Integration Tests
* **Map Loading:** Verify PMTiles integration works across browsers
* **Style Updates:** Test complete user workflow from UI interaction to map render
* **Export Functionality:** Validate exported JSON can be re-imported successfully
* **Error Recovery:** Test tile failure and recovery scenarios

### Performance Tests
* **Load Time:** Automated testing with Lighthouse CI
* **Memory Usage:** Monitor memory consumption during extended use
* **Render Performance:** FPS monitoring during rapid style changes
* **Bundle Size:** Track asset sizes and loading times

### Browser Compatibility Matrix
| Feature | Chrome 80+ | Firefox 75+ | Safari 13.1+ | Edge 80+ |
|---------|------------|-------------|--------------|----------|
| PMTiles Loading | ✅ | ✅ | ✅ | ✅ |
| Color Picker | ✅ | ✅ | ✅ (text fallback) | ✅ |
| Canvas Export | ✅ | ✅ | ✅ | ✅ |
| WebGL Rendering | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ (optional) | ✅ (optional) | ✅ (optional) | ✅ (optional) |

---

## 🔄 Development and Deployment

### Development Workflow (No Build System)
```bash
# Simple development approach
python -m http.server 8000  # Or any local server for CORS
# OR
npx serve .                 # If you prefer Node-based serving

# Testing (when implemented)
npm test                    # Run tests with minimal setup
```

### Production Deployment
```bash
# Simple deployment process
git add .
git commit -m "Update application"
git push origin main        # GitHub Actions handles the rest
```

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml (minimal example)
name: Deploy to GitHub Pages
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true          # For PMTiles
      - uses: actions/deploy-pages@v4
```

### Deployment Configuration
* **Hosting:** GitHub Pages with GitHub LFS for PMTiles
* **CDN:** MapLibre/PMTiles via jsDelivr, PicoCSS via CDN
* **Service Worker:** Optional, for offline tile caching
* **PWA:** Basic manifest.json for mobile "install" option
* **Analytics:** Optional, privacy-friendly usage tracking

---

## 🔮 Future AI Integration Architecture

### AI Style Generation Interface
```javascript
class AIStyleGenerator {
  constructor(apiKey) {
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.apiKey = apiKey;
  }

  async generateStyle(prompt, baseStyle) {
    // Send prompt + current style context to LLM
    // Parse response into MapLibre style diff
    // Validate generated style before applying
    // Return preview-able style object
  }

  async mutateStyle(currentStyle, mutation) {
    // Generate variations of current style
    // Apply constrained randomization
    // Ensure accessibility compliance
  }
}
```

### Integration Strategy
* **Privacy First:** All AI features optional, no data stored externally
* **User Control:** AI suggestions are previews only, user must explicitly accept
* **Graceful Degradation:** All core features work without AI integration
* **Cost Management:** Rate limiting and token usage monitoring

---

## 📝 API Documentation

### AppState Methods
```javascript
// State management
updateStyle(layerId: string, property: string, value: any): void
toggleLayerVisibility(layerId: string): void
applyTheme(themeName: string): Promise<void>
getCurrentStyle(): StyleObject
pushToHistory(): void
undo(): boolean
redo(): boolean

// Event system
addEventListener(event: string, callback: Function): void
removeEventListener(event: string, callback: Function): void
emit(event: string, data: any): void
```

### MapController Methods  
```javascript
// Map operations
initializeMap(containerId: string, style: StyleObject): Promise<void>
updateStyle(style: StyleObject, options?: UpdateOptions): void
exportPNG(options?: ExportOptions): Promise<Blob>
fitBounds(bounds: BoundsArray): void
getCenter(): [number, number]
getZoom(): number
cleanup(): void
```

### StyleManager Methods
```javascript
// Style manipulation
static cloneStyle(style: StyleObject): StyleObject
static updateLayerPaint(style: StyleObject, layerId: string, property: string, value: any): StyleObject
static validateStyleObject(style: StyleObject): ValidationResult
static generateStyleDiff(oldStyle: StyleObject, newStyle: StyleObject): StyleDiff
static applyStyleDiff(style: StyleObject, diff: StyleDiff): StyleObject
```

---

## 🧘 Dharma Drop

> "When function flows through form, and care shapes code, the map becomes a mirror of mind."