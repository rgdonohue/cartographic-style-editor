# Layer Names Configuration

This file documents the assumed source-layer names used in the MapLibre style. These may need to be adjusted based on the actual structure of your MBTiles/PMTiles files.

## Current Assumptions

The default style currently assumes these source-layer names:

- **co_roads** source uses `"source-layer": "roads"`
- **co_railways** source uses `"source-layer": "railways"`  
- **co_power_lines** source uses `"source-layer": "power_lines"`

## How to Check Actual Layer Names

To inspect your MBTiles files and find the correct source-layer names:

```bash
# Install pmtiles CLI if not already installed
npm install -g pmtiles

# Convert MBTiles to PMTiles first
pmtiles convert co_roads.mbtiles co_roads.pmtiles
pmtiles convert co_railways.mbtiles co_railways.pmtiles  
pmtiles convert co_power_lines.mbtiles co_power_lines.pmtiles

# Inspect the PMTiles structure
pmtiles show co_roads.pmtiles
pmtiles show co_railways.pmtiles
pmtiles show co_power_lines.pmtiles
```

Alternatively, use MBTiles tools:

```bash
# Install sqlite3 if needed
# Then inspect MBTiles metadata
sqlite3 co_roads.mbtiles "SELECT name, value FROM metadata;"
```

## Updating Source Layer Names

If your actual source-layer names are different, update them in:

1. `src/styles/defaultStyle.js` - Update each layer's `"source-layer"` property
2. No other files need changes - the application uses the layer IDs (`co_roads`, `co_railways`, `co_power_lines`) for UI controls

## Common Source Layer Names

Depending on how your data was processed, you might see names like:

- `"roads"`, `"highways"`, `"street"`, `"lines"`
- `"railways"`, `"railroad"`, `"rail"`, `"tracks"`  
- `"power_lines"`, `"power"`, `"electrical"`, `"transmission"`

## Testing the Integration

After updating source-layer names:

1. Convert your MBTiles to PMTiles
2. Serve the application locally: `python -m http.server 8000`
3. Open `http://localhost:8000/public/` in your browser
4. Check browser console for any tile loading errors
5. Verify that layers appear and can be toggled on/off

If layers don't appear, the most likely issue is incorrect source-layer names.