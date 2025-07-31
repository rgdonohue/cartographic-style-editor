# PMTiles Directory

This directory should contain the Colorado infrastructure PMTiles files:

- `colorado_highways.pmtiles` - Colorado highway network data
- `colorado_rivers.pmtiles` - Colorado river network data  
- `colorado_rails.pmtiles` - Colorado railway network data
- `osm_points.pmtiles` - Points of interest data

## File Requirements

- Format: PMTiles (vector tiles)
- Zoom levels: 6-12
- Projection: Web Mercator (EPSG:3857)
- Maximum tile size: 500KB
- Total size target: ~8MB compressed

## Data Sources

- **colorado_highways**: State DOT highway network (public domain)
- **colorado_rivers**: USGS National Hydrography Dataset (public domain)  
- **colorado_rails**: OpenStreetMap railway data (ODbL license)
- **osm_points**: Selected POIs from OpenStreetMap (ODbL license)

## Creating PMTiles

Use [tippecanoe](https://github.com/mapbox/tippecanoe) to generate MBTiles, then convert to PMTiles:

```bash
# Generate MBTiles from GeoJSON
tippecanoe -o colorado_highways.mbtiles --maximum-zoom=12 --minimum-zoom=6 --maximum-tile-bytes=500000 colorado_highways.geojson

# Convert to PMTiles
pmtiles convert colorado_highways.mbtiles colorado_highways.pmtiles
```

## Hosting

These files should be hosted using GitHub LFS or a CDN with proper CORS headers enabled for browser access.