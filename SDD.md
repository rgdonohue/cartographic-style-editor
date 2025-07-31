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
* **Map Rendering:** MapLibre GL JS v3.6+
* **Styling:** PicoCSS v2.0+
* **Tile Loading:** @protomaps/pmtiles v3.0+
* **Color Picking:** Native `<input type="color">` with Pickr fallback
* **Export:** Canvas API for PNG export, Blob API for JSON download

### Browser Requirements
* **Minimum:** Chrome 80+, Firefox 75+, Safari 13.1+
* **Required APIs:** WebGL2, Canvas API, Blob API, Service Worker API
* **Memory:** 2GB RAM minimum, 4GB recommended

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
    // Create accessible color input
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
  cacheSize: 100 // Max tiles in memory
};
```

### Bundle Size Optimization
* **Code Splitting:** Dynamic imports for theme data and validation
* **Tree Shaking:** ES modules with explicit exports
* **Asset Optimization:** PMTiles compressed with brotli
* **Service Worker:** Cache-first strategy for tiles, network-first for app updates

---

## 🚨 Error Handling Strategy

### Error Categories and Responses

| Error Type | Detection Method | User Response | Recovery Action |
|------------|------------------|---------------|-----------------|
| **Tile Load Failure** | `map.on('error')` | "Map tiles failed to load" + retry button | Exponential backoff retry, fallback to cached tiles |
| **Invalid Style JSON** | `StyleManager.validate()` | Specific validation error + highlight field | Revert to last valid state, suggest corrections |
| **Export Failure** | Try/catch in export functions | "Export failed" + download alternative | Offer JSON text preview, suggest browser update |
| **Memory Overflow** | Performance observer | "Performance warning" + simplify option | Reduce tile cache, limit history stack |
| **Network Offline** | `navigator.onLine` | "Offline mode" indicator | Switch to cached tiles only |

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
| Color Picker | ✅ | ✅ | ⚠️ (limited) | ✅ |
| Canvas Export | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

---

## 🔄 Build and Deployment

### Development Workflow
```bash
# Local development server
npm run dev          # Start local server with live reload
npm run test         # Run unit and integration tests  
npm run test:e2e     # Run browser automation tests
npm run lint         # ESLint + Prettier
npm run perf         # Performance audit
```

### Production Build
```bash
# Optimization pipeline
npm run build        # Minify JS/CSS, optimize assets
npm run build:tiles  # Compress PMTiles with optimal settings
npm run build:pwa    # Generate service worker and manifest
npm run deploy       # Deploy to GitHub Pages
```

### Deployment Configuration
* **Hosting:** GitHub Pages with custom domain
* **CDN:** All assets served with appropriate cache headers
* **Service Worker:** Cache-first for tiles, network-first for app code
* **PWA:** Installable with offline capability
* **Analytics:** Privacy-friendly usage tracking

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