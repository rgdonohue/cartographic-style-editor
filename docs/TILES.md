# Getting Colorado Tile Data

The Map Remix application requires Colorado infrastructure tile data to display roads, railways, and power lines. Due to file size constraints (300MB+ total), these files are not included in the repository.

## Quick Setup

### Option 1: Use Provided Data (Recommended)
If you have access to the pre-processed Colorado tiles:

1. **Download the PMTiles files**:
   - `co_roads.pmtiles` (281MB)
   - `co_railways.pmtiles` (11MB) 
   - `co_power_lines.pmtiles` (19MB)

2. **Place in assets/tiles directory**:
   ```bash
   # Your file structure should look like:
   assets/tiles/
   ├── co_roads.pmtiles
   ├── co_railways.pmtiles
   ├── co_power_lines.pmtiles
   └── README.md
   ```

3. **Start the application**:
   ```bash
   python -m http.server 8000
   # Open http://localhost:8000/public/
   ```

### Option 2: Generate Your Own Data
Create tiles from OpenStreetMap data using [Tilecraft](https://github.com/rgdonohue/tilecraft):

1. **Install Tilecraft**:
   ```bash
   npm install -g tilecraft
   ```

2. **Download Colorado OSM data**:
   ```bash
   # Download Colorado extract from Geofabrik
   wget https://download.geofabrik.de/north-america/us/colorado-latest.osm.pbf
   ```

3. **Configure Tilecraft** (create `tilecraft.config.js`):
   ```javascript
   module.exports = {
     input: 'colorado-latest.osm.pbf',
     output: 'tiles/',
     layers: {
       roads: {
         filter: ['highway'],
         minzoom: 0,
         maxzoom: 14
       },
       railways: {
         filter: ['railway'],
         minzoom: 0,
         maxzoom: 14
       },
       power_lines: {
         filter: ['power', 'line'],
         minzoom: 0,
         maxzoom: 14
       }
     }
   };
   ```

4. **Generate tiles**:
   ```bash
   tilecraft
   ```

5. **Convert to PMTiles**:
   ```bash
   npm install -g pmtiles
   pmtiles convert co_roads.mbtiles co_roads.pmtiles
   pmtiles convert co_railways.mbtiles co_railways.pmtiles
   pmtiles convert co_power_lines.mbtiles co_power_lines.pmtiles
   ```

## Demo Mode

If you don't have tile data, the application will automatically run in demo mode:

- ✅ **All UI features work** - test themes, export, import
- ✅ **No data required** - perfect for development and testing
- ✅ **Graceful fallback** - clear messaging about missing data

## Alternative Data Sources

You can use any PMTiles data by:

1. **Updating source URLs** in `src/styles/defaultStyle.js`
2. **Modifying layer configuration** in the same file
3. **Adjusting source-layer names** to match your data

## Troubleshooting

**Application loads but no data appears:**
- Check browser console for 404 errors
- Verify PMTiles files are in `assets/tiles/`
- Ensure local server is running (not file:// protocol)

**Performance issues:**
- PMTiles are optimized for web delivery
- Consider reducing zoom levels for very large datasets
- Use browser dev tools to monitor memory usage

**Custom data integration:**
- Use `pmtiles show your-file.pmtiles` to inspect structure
- Update `source-layer` names in the style configuration
- Test with small areas first before processing entire states

## File Sizes

Typical file sizes for Colorado:
- **Roads**: ~280MB (comprehensive network, all zoom levels)
- **Railways**: ~11MB (historical and active lines)
- **Power Lines**: ~19MB (transmission and distribution)

Total: ~310MB for complete Colorado infrastructure data.