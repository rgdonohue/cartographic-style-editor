# Cartographic Style Editor

!Cartographic Style Editor Application](images/app.png)

**Cartographic Style Editor** is a browser-based, interactive cartographic design tool that enables users to customize the visual style of Colorado infrastructure data in real time. Built with vanilla JavaScript and MapLibre GL JS, it leverages PMTiles for efficient vector tile rendering and provides an intuitive interface for map styling.

## ✨ Features

### 🎨 **Interactive Style Editing**
- **Layer Controls**: Toggle visibility of roads, railways, and power lines
- **Style Controls**: Adjust colors, line widths, and opacity with live preview
- **Color Pickers**: Native color inputs with text fallbacks for all browsers
- **Real-time Updates**: See changes instantly with 100ms debounced updates

### 🎭 **Theme System**
- **5 Curated Themes**: Default, Retro, Night, Terrain, and Minimal
- **One-Click Application**: Instantly transform your map's appearance
- **Custom Themes**: Easy to add your own color schemes

### 📤 **Export & Import**
- **JSON Export**: Save your custom styles as MapLibre GL JS compatible JSON
- **PNG Export**: Generate high-quality map images (1024x768px)
- **Drag & Drop Import**: Load existing styles by dropping JSON files
- **Metadata Preservation**: Exports include theme info and layer visibility

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+Z` / `Cmd+Z`: Undo changes
- `Ctrl+Y` / `Cmd+Shift+Z`: Redo changes  
- `Ctrl+S` / `Cmd+S`: Export JSON style
- `Ctrl+E` / `Cmd+E`: Export PNG image
- `R`: Reset to default style
- `Esc`: Clear error messages

### ♿ **Accessibility**
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Compatible**: ARIA labels and live regions
- **High Contrast Support**: Adapts to system accessibility preferences
- **Color-Blind Friendly**: Themes designed for accessibility

## 🗺️ Data Sources

The application uses Colorado infrastructure data in PMTiles format, sourced from OpenStreetMap and processed with [Tilecraft](https://github.com/rgdonohue/tilecraft):

- **Roads** (281MB): Comprehensive road network extracted from OSM
- **Railways** (11MB): Historical and active railway infrastructure from OSM
- **Power Lines** (19MB): Electrical transmission and distribution network from OSM

All data is served locally with no external API dependencies. The raw OSM data was filtered, processed, and converted to vector tiles using Tilecraft, then converted to PMTiles format for efficient browser delivery.

## 🚀 Quick Start

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for CORS compatibility)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cartographic-style-editor
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. **Open in browser**
   ```
   http://localhost:8000/public/
   ```

The application will automatically detect if PMTiles are available and gracefully fall back to demo mode if not.

### Converting Your Own Data

If you have MBTiles files, convert them to PMTiles:

```bash
# Install pmtiles
npm install -g pmtiles

# Convert files
pmtiles convert your-data.mbtiles your-data.pmtiles

# Update src/styles/defaultStyle.js with your source URLs
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES2020+)
- **Mapping**: MapLibre GL JS v3.6+
- **Styling**: PicoCSS v2.0+
- **Tiles**: PMTiles v3.0+ for vector data
- **Build**: No bundler - direct ES module imports

### Project Structure
```
├── public/           # Static files and main HTML
├── src/
│   ├── main.js      # Application entry point
│   ├── map/         # MapLibre integration and tile loading
│   ├── ui/          # User interface components
│   ├── state/       # Application state management
│   ├── styles/      # Map styles and themes
│   └── utils/       # Helper functions
├── assets/tiles/    # PMTiles data files
└── docs/           # Documentation
```

### Key Features
- **Modular Architecture**: Clean separation of concerns
- **Event-Driven**: Loose coupling between components
- **Performance Optimized**: Debounced updates and efficient rendering
- **Error Resilient**: Graceful fallbacks and user-friendly error handling

## 🎯 Browser Support

- **Chrome 80+**: Full support
- **Firefox 75+**: Full support  
- **Safari 13.1+**: Full support with text input fallbacks
- **Edge 80+**: Full support

**Requirements**: WebGL, Canvas API, Blob API support

## 📖 Usage Guide

### Basic Editing
1. **Toggle Layers**: Use checkboxes to show/hide infrastructure types
2. **Change Colors**: Click color pickers to adjust layer colors
3. **Adjust Line Styles**: Use sliders to modify width and opacity
4. **Apply Themes**: Click theme buttons for instant style changes

### Advanced Features
1. **Undo/Redo**: Track your changes with full history support
2. **Export Styles**: Save your work as JSON or PNG files
3. **Import Styles**: Load existing styles via drag-and-drop
4. **Keyboard Shortcuts**: Speed up your workflow with hotkeys

### Custom Themes
Add new themes to `src/styles/themes.js`:

```javascript
export const themes = {
  myTheme: {
    name: 'My Custom Theme',
    description: 'A unique style',
    background: { 'background-color': '#f0f0f0' },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#ff6b35',
          'line-width': 2,
          'line-opacity': 0.8
        }
      }
      // ... other layers
    }
  }
};
```

## 🛠️ Development

### Local Development
```bash
# No build step required - just serve files
python -m http.server 8000

# For tile conversion
node convert-tiles.js
```

### Testing
- **Manual Testing**: Open application and test all features
- **Error Handling**: Verify graceful fallbacks work
- **Performance**: Check responsiveness with large datasets
- **Accessibility**: Test with keyboard navigation and screen readers

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MapLibre GL JS**: For excellent web mapping capabilities
- **PMTiles**: For efficient vector tile serving
- **OpenStreetMap**: For comprehensive infrastructure data
- **Tilecraft**: For streamlined OSM data processing and tile generation
- **PicoCSS**: For lightweight, accessible styling

## 🤝 Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: See `docs/` folder for detailed guides
- **Examples**: Check `QUICKSTART.md` for common use cases

---

Built with ❤️ for the cartographic community. Happy mapping! 🗺️