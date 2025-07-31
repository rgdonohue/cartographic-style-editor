# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Map Remix is a browser-based cartographic style editor for Colorado infrastructure data (highways, rivers, rails, POIs). The application is built with Vanilla JavaScript and MapLibre GL JS, using PMTiles for efficient vector tile loading. The project follows an agent-friendly, modular architecture designed for AI-assisted development.

## Development Commands

Since this is currently a planning-phase project with only PRD and SDD documents, no build system exists yet. When implementation begins, the planned commands are:

```bash
# Development workflow (planned)
npm run dev          # Start local development server with live reload
npm run test         # Run unit and integration tests  
npm run test:e2e     # Run browser automation tests
npm run lint         # ESLint + Prettier code formatting
npm run perf         # Performance audit with Lighthouse

# Production build (planned)
npm run build        # Minify JS/CSS, optimize assets
npm run build:tiles  # Compress PMTiles with optimal settings
npm run build:pwa    # Generate service worker and manifest
npm run deploy       # Deploy to GitHub Pages
```

## Architecture Overview

### Planned File Structure
```
/public/
  |- index.html           # Main HTML entry point
  |- styles.css          # Global styles using PicoCSS
  |- manifest.json       # PWA manifest
/src/
  |- main.js            # Entry point and app initialization
  |- state/             # Application state management
      |- AppState.js    # Central state store with event system
      |- StyleManager.js # Style object manipulation and validation
  |- map/               # MapLibre setup and PMTiles loading
      |- MapController.js # Primary MapLibre interface
      |- TileLoader.js   # PMTiles integration and error handling
      |- MapEvents.js    # Map interaction event handlers
  |- ui/                # UI components and event bindings
      |- LayerControls.js  # Layer visibility toggles
      |- StyleControls.js  # Color pickers, sliders for style editing
      |- ExportControls.js # JSON/PNG export functionality
      |- ThemeSelector.js  # Preset theme application
      |- ErrorDisplay.js   # User-facing error notifications
  |- styles/
      |- themes.js       # Theme presets (Retro, Night, Terrain, etc.)
      |- defaultStyle.js # Default MapLibre style configuration
  |- utils/
      |- helpers.js      # Utility functions
      |- validation.js   # Style validation against MapLibre spec
      |- debounce.js     # Performance utilities
/assets/
  |- tiles/*.pmtiles    # Colorado infrastructure vector tiles
  |- icons/             # UI icons and assets
/tests/
  |- unit/             # Jest unit tests
  |- integration/      # Cross-component integration tests
```

### Technology Stack
- **Language**: JavaScript ES2020+ (optional chaining, nullish coalescing, dynamic imports)
- **Map Rendering**: MapLibre GL JS v3.6+
- **Styling**: PicoCSS v2.0+ (lightweight CSS framework)
- **Tile Loading**: @protomaps/pmtiles v3.0+
- **Testing**: Jest + DOM Testing Library
- **Browser Requirements**: Chrome 80+, Firefox 75+, Safari 13.1+ (WebGL2 required)

### Data Flow Architecture
```
User Interaction → UI Component → AppState → StyleManager → MapController → MapLibre
     ↑                                                                           ↓
Error Display ← ErrorHandler ← ValidationLayer ← StateChange ← RenderEngine ←──┘
```

## Key Implementation Patterns

### State Management
- Central `AppState` class manages all application state with event system
- Immutable style updates through `StyleManager.updateLayerPaint()`
- Undo/redo functionality via style history stack
- Debounced style changes (100ms) to prevent render thrashing

### Performance Optimizations
- Use `setPaintProperty()` for single property changes, `setStyle()` only for major updates
- Implement exponential backoff retry for failed tile loads
- Pre-cache tiles around visible area for offline capability
- Style object pooling for undo/redo operations

### Error Handling Strategy
- Tile load failures: Exponential backoff retry with user notification
- Invalid style JSON: Specific validation errors with field highlighting
- Export failures: Fallback to JSON text preview
- Network offline: Switch to cached tiles only mode

### Code Quality Requirements
- All modules use ES6 classes and modules for clear structure
- JSDoc comments for all public methods and complex logic
- Functional programming patterns where possible
- Single responsibility principle for all components
- No external dependencies beyond MapLibre GL JS and PMTiles

## Data Sources
- **colorado_highways**: State DOT highway network (public domain)
- **colorado_rivers**: USGS National Hydrography Dataset (public domain)  
- **colorado_rails**: OpenStreetMap railway data (ODbL license)
- **osm_points**: Selected POIs from OpenStreetMap (ODbL license)
- **Zoom Range**: 6-12 (statewide to city level)
- **Total Size**: ~8MB compressed PMTiles

## Future AI Integration
When implemented, AI features will be:
- Privacy-first: Optional API key integration, no external data storage
- User-controlled: AI suggestions are previews only, user must accept
- Graceful degradation: All core features work without AI
- Natural language styling: "Make this look like a vintage hiking map"