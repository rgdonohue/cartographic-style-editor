# Product Requirements Document (PRD)

## Project Title: **Map Remix – A Live Cartographic Style Editor**

---

## 📘 Summary

Map Remix is a browser-based, interactive cartographic design tool that enables users to customize the visual style of Colorado highway, river, and rail data in real time. It leverages pre-rendered vector tiles (PMTiles) and MapLibre GL JS to let users toggle layers, adjust symbology, apply predefined themes, and export their custom map styles as JSON files.

This tool is intended as both a creative sandbox and a frontend experiment in agentic, modular development. It also serves as a testbed for PRD/SDD-driven workflows with AI co-development.

---

## 🎯 Goals

* Empower users to interactively edit map styles with immediate feedback.
* Enable the export and reuse of custom styles via JSON.
* Explore LLM-assisted cartographic styling in a tightly scoped, frontend-only tool.
* Showcase beautiful, expressive maps from vector tile data without backend complexity.

---

## 🧑‍💻 Target Users

| Persona            | Description                                                                 | Primary Use Case |
| ------------------ | --------------------------------------------------------------------------- | ---------------- |
| **Carto Designer** | Wants to prototype styles before applying them in Mapbox Studio or Tilemill | Rapid prototyping |
| **Student**        | Learning about map symbology and wants to experiment with styles easily     | Educational exploration |
| **Educator**       | Uses it to demo cartographic design principles                              | Teaching tool |
| **Creative Coder** | Sees maps as visual media and wants to remix, mutate, or animate them       | Artistic expression |

---

## 🧭 User Journey

1. **Initial Load:** User loads the app in a browser (desktop-first, mobile-tolerant)
2. **Map Initialization:** MapLibre initializes with a default style and PMTiles source
3. **Layer Control:** User toggles layers (highways, rivers, rails) and sees immediate visual feedback
4. **Style Customization:** User adjusts style parameters via UI (color, width, opacity) with live preview
5. **Theme Exploration:** Optionally, user loads a style theme or triggers "Shuffle" for inspiration
6. **Export & Share:** User exports their current style as `style.json` and/or PNG snapshot

**Expected Time to First Export:** < 2 minutes for new users

---

## 🔑 Features

### Core (MVP)

* **Map Rendering:** Vector tiles via MapLibre GL JS from hosted PMTiles
* **Layer Controls:** Toggle visibility of highways, rivers, rails, and optional OSM points
* **Symbology Editor:** Color pickers, stroke width sliders (1-10px), opacity controls (0-100%)
* **Style Themes:** 3–5 curated presets (Retro, Night, Terrain, Minimal, High Contrast)
* **Export Functions:** 
  - Download current style as `style.json`
  - Export static PNG snapshot of current map view (1024x768px)
* **Reset Function:** One-click return to default style

### Next Phase (Stretch Goals)

* **Style Randomizer:** "Surprise Me" button with aesthetic constraints
* **Import/Export:** Load external `style.json` files with validation
* **URL Sharing:** Save/share map configurations as query strings
* **Enhanced Mobile:** Responsive layout optimization and PWA support
* **Performance:** Service worker for full offline functionality
* **AI Integration:** Style generation from natural language prompts

---

## 📦 Technical Specifications

### Frontend Stack
* **Core:** Vanilla JavaScript (ES2020+), MapLibre GL JS v3.x
* **Styling:** PicoCSS (lightweight alternative to Bulma for faster loads)
* **Build:** No bundler required - direct ES module imports

### Data & Performance
* **Tile Format:** PMTiles (vector) served over HTTPS with CORS headers
* **Target Bundle Size:** < 15MB total (tiles + assets) for offline capability
* **Tile Optimization:** Tippecanoe-generated at zoom levels 6–12, max 500KB per tile
* **Browser Support:** Modern Chromium, Firefox, Safari (WebGL2 required)

### Code Architecture
* **Agent-Friendly Design:** 
  - Modular ES modules with single responsibilities
  - Clear folder structure: `/src/components/`, `/src/utils/`, `/src/styles/`
  - Documented APIs with JSDoc comments
  - Functional programming patterns where possible

### Licensing & Data
* **Base Data:** OSM under ODbL, Colorado state data confirmed public domain
* **Code License:** MIT (for maximum reusability)
* **Distribution:** Static hosting compatible (GitHub Pages, Netlify, etc.)

---

## 🔗 Feature Dependencies & Implementation Order

| Phase | Feature | Depends On | Estimated Effort |
|-------|---------|------------|------------------|
| 1 | Map Rendering | PMTiles setup, MapLibre config | 2 days |
| 1 | Layer Controls | Map rendering, UI framework | 1 day |
| 1 | Basic Symbology | Layer controls, style mutation logic | 2 days |
| 1 | Style Export | Complete style management system | 1 day |
| 1 | Preset Themes | Style export, theme data structure | 1 day |
| 2 | Style Import | Export functionality, JSON validation | 1 day |
| 2 | URL Sharing | Style serialization, browser history API | 1 day |
| 3 | AI Integration | External API setup, prompt engineering | 3+ days |

**Total MVP Estimate:** 7 development days

---

## ⚙️ Performance & Error Handling

### Performance Targets
* **Initial Load:** < 3 seconds on 10 Mbps connection
* **Style Changes:** < 100ms visual feedback for all controls
* **Memory Usage:** < 200MB RAM on low-spec devices
* **Tile Loading:** Progressive loading with visual indicators

### Error Handling Strategy
* **Tile Load Failures:** Graceful fallback with user notification and retry option
* **Invalid JSON:** Real-time validation with specific error messages
* **Browser Compatibility:** Feature detection with graceful degradation
* **Network Issues:** Offline detection with appropriate messaging

---

## 🧪 Measurable Success Criteria

| Metric | Target | Measurement Method | Timeline |
|--------|--------|--------------------|----------|
| App loads within | < 3 seconds | Lighthouse audit on 10 Mbps connection | Pre-launch |
| Style export workflow | < 2 minutes | Moderated user testing (n=10) with task scenarios | Week 1 post-launch |
| Feature discoverability | 80% of users find all core features | User testing with think-aloud protocol | Week 2 post-launch |
| Positive user experience | 4.5/5 average rating | Post-use survey (n=20) with Likert scale + comments | Month 1 post-launch |
| Style theme adoption | 60% users try at least 2 themes | Analytics tracking on theme button clicks | Month 1 post-launch |

---

## 🧠 AI Integration Plan

> **Status:** Moved to Phase 2 based on MVP focus

### Future AI-Driven Features
* **Natural Language Styling:** "Make this look like a vintage hiking map"
* **Smart Color Palettes:** Context-aware color suggestions based on geographic features
* **Style Mutations:** Algorithmic variations of user-created styles
* **Batch Generation:** CLI tool for creating multiple themed variations

### Integration Approach
* **User Control:** AI suggestions are previews only - users explicitly accept changes
* **Transparency:** Clear indication of AI-generated vs user-created elements  
* **Fallback:** All features work without AI integration
* **Privacy:** Optional API key integration - no data stored on external servers

---

## ⚖️ Competitive Landscape

| Tool | Strengths | Weaknesses | Map Remix Advantage |
|------|-----------|------------|-------------------|
| **Mapbox Studio** | Full-featured, professional | Account required, complex learning curve | No signup, instant gratification |
| **Maputnik** | Open-source, powerful editor | Technical interface, no live interaction | Playful UI, immediate visual feedback |
| **QGIS** | Incredibly capable, free | Desktop-only, steep learning curve | Browser-based, mobile-friendly |
| **Map Remix** | **Fast, intuitive, focused** | **Limited to Colorado, basic features** | **Perfect for prototyping & learning** |

---

## 🗺️ Tile Data Reference

### Data Sources
Using MBTiles converted to PMTiles via `pmtiles convert`:

* **colorado_highways** - State DOT highway network (confirmed public domain)
* **colorado_rivers** - USGS National Hydrography Dataset (public domain)  
* **colorado_rails** - OpenStreetMap railway data (ODbL license)
* **osm_points** - Selected POIs from OpenStreetMap (ODbL license)

### Technical Specs
* **Zoom Range:** 6-12 (statewide to city level)
* **Total Size:** ~8MB compressed
* **Update Frequency:** Static dataset (no real-time updates required)
* **Projection:** Web Mercator (EPSG:3857)

---

## 🚀 Launch Strategy

### Pre-Launch (Week -2)
* [ ] Beta testing with 5 cartography students
* [ ] Performance testing on various devices/browsers
* [ ] Documentation and help system creation

### Launch (Week 0)
* [ ] Deploy to GitHub Pages with custom domain
* [ ] Announce on cartography Twitter/Reddit communities
* [ ] Create demo video showing key workflows

### Post-Launch (Weeks 1-4)
* [ ] Collect user feedback through embedded survey
* [ ] Monitor analytics for usage patterns
* [ ] Iterate on UI based on user behavior data
* [ ] Plan Phase 2 features based on demand

---

## 🧘 Dharma Drop

> "Color is the breath of form; design is the echo of intention. When style becomes a practice of awareness, the map reflects more than terrain — it reflects care."