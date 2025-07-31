# Quick Start Guide

## Testing Map Remix Right Now

Map Remix is ready to test! It will automatically detect if PMTiles are available and fall back to demo mode if not.

### 1. Start Local Server

```bash
# From project root directory
python -m http.server 8000

# Or if you prefer Node.js
npx serve .
```

### 2. Open Application

Navigate to: `http://localhost:8000/public/`

The application will:
- ✅ Load in **demo mode** if PMTiles are missing (expected for now)
- ✅ Show all UI controls and functionality
- ✅ Allow testing themes, export, and style controls
- ✅ Display helpful message about converting tiles

### 3. Convert Your MBTiles (To See Real Data)

Run the conversion helper:
```bash
node convert-tiles.js
```

Then convert each file:
```bash
# Install pmtiles globally
npm install -g pmtiles

# Convert your files
pmtiles convert assets/tiles/co_roads.mbtiles assets/tiles/co_roads.pmtiles
pmtiles convert assets/tiles/co_railways.mbtiles assets/tiles/co_railways.pmtiles  
pmtiles convert assets/tiles/co_power_lines.mbtiles assets/tiles/co_power_lines.pmtiles
```

### 4. Refresh and See Your Data

After conversion, refresh your browser and the application will automatically load your Colorado infrastructure data!

## What Works in Demo Mode

- ✅ **All UI Controls** - Layer toggles, style controls, theme selector
- ✅ **Export Functions** - JSON style export, PNG export (of the demo view)
- ✅ **Import Functions** - Drag-and-drop JSON import
- ✅ **Keyboard Shortcuts** - Ctrl+Z (undo), Ctrl+S (export), etc.
- ✅ **Theme System** - All 5 themes work (colors apply to background)
- ✅ **Error Handling** - Graceful fallback and user messaging

## Troubleshooting

**If you see 404 errors in console:** This is expected! The app detects missing PMTiles and automatically switches to demo mode.

**If layers don't appear after conversion:** Check the `LAYER_NAMES.md` file for troubleshooting source-layer names.

**Application won't load at all:** Make sure you're serving from a local server (not opening file:// directly) due to CORS restrictions.

## Next Steps

1. **Test the demo mode** - Verify all functionality works
2. **Convert your tiles** - See your actual Colorado data
3. **Deploy to GitHub Pages** - Share your styled maps
4. **Customize** - Add your own themes and modify styles

The application is fully functional and ready for use!