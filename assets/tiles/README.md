# Colorado Tile Data Directory

This directory contains Colorado infrastructure tile data for Map Remix.

## Current Files

- `co_roads.mbtiles` - Colorado road network data
- `co_railways.mbtiles` - Colorado railway network data  
- `co_power_lines.mbtiles` - Colorado power line infrastructure data

## File Requirements

- **Current Format**: MBTiles (vector tiles)
- **Target Format**: PMTiles (for browser compatibility)
- Zoom levels: 6-12 (recommended)
- Projection: Web Mercator (EPSG:3857)
- Maximum tile size: 500KB (recommended)

## Data Sources

- **co_roads**: Colorado road network infrastructure
- **co_railways**: Colorado railway network infrastructure
- **co_power_lines**: Colorado electrical power line infrastructure

## Converting to PMTiles

The current MBTiles files need to be converted to PMTiles for browser compatibility:

```bash
# Install pmtiles CLI tool
npm install -g pmtiles

# Convert each MBTiles file to PMTiles
pmtiles convert co_roads.mbtiles co_roads.pmtiles
pmtiles convert co_railways.mbtiles co_railways.pmtiles  
pmtiles convert co_power_lines.mbtiles co_power_lines.pmtiles
```

## Usage in Map Remix

Once converted to PMTiles, these files will be referenced in the MapLibre style as:

```javascript
"sources": {
  "co_roads": {
    "type": "vector", 
    "url": "pmtiles://assets/tiles/co_roads.pmtiles"
  },
  "co_railways": {
    "type": "vector",
    "url": "pmtiles://assets/tiles/co_railways.pmtiles" 
  },
  "co_power_lines": {
    "type": "vector",
    "url": "pmtiles://assets/tiles/co_power_lines.pmtiles"
  }
}
```

## Hosting

For production deployment:
- Use GitHub LFS for PMTiles files (recommended)
- Ensure CORS headers are properly configured
- Consider CDN hosting for better performance

## Layer Names

You may need to inspect the MBTiles files to determine the correct source-layer names:

```bash
# Inspect MBTiles structure
pmtiles show co_roads.mbtiles
pmtiles show co_railways.mbtiles  
pmtiles show co_power_lines.mbtiles
```