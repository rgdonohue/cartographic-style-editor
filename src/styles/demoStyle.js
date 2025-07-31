/**
 * Demo MapLibre style configuration using OpenStreetMap for testing
 * This provides a working demo when PMTiles are not available
 */

export const demoStyle = {
  "version": 8,
  "name": "Map Remix Demo",
  "metadata": {
    "mapbox:autocomposite": false,
    "mapbox:type": "template"
  },
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      "tileSize": 256,
      "attribution": "© OpenStreetMap contributors"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#f8f9fa"
      }
    },
    {
      "id": "osm-raster",
      "type": "raster",
      "source": "osm",
      "paint": {
        "raster-opacity": 0.8
      }
    }
  ],
  "center": [-105.7821, 39.7391],
  "zoom": 7,
  "bearing": 0,
  "pitch": 0
};

/**
 * Demo layer configuration - simplified for demonstration
 */
export const demoLayerConfig = {
  "osm-raster": {
    "name": "OpenStreetMap Base",
    "type": "raster",
    "defaultVisible": true,
    "styleProperties": ["raster-opacity"]
  }
};