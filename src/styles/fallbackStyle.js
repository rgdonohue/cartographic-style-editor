/**
 * Fallback style for when PMTiles are not available
 * Uses a simple background and demonstrates UI functionality
 */

export const fallbackStyle = {
  "version": 8,
  "name": "Map Remix Fallback",
  "metadata": {
    "mapbox:autocomposite": false,
    "mapbox:type": "template"
  },
  "sources": {},
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#f8f9fa"
      }
    },
    {
      "id": "co_roads",
      "type": "background",
      "paint": {
        "background-color": "#FF5722"
      },
      "layout": {
        "visibility": "none"
      }
    },
    {
      "id": "co_railways", 
      "type": "background",
      "paint": {
        "background-color": "#795548"
      },
      "layout": {
        "visibility": "none"
      }
    },
    {
      "id": "co_power_lines",
      "type": "background", 
      "paint": {
        "background-color": "#9C27B0"
      },
      "layout": {
        "visibility": "none"
      }
    }
  ],
  "center": [-105.7821, 39.7391],
  "zoom": 7,
  "bearing": 0,
  "pitch": 0
};

/**
 * Fallback layer configuration for UI testing
 */
export const fallbackLayerConfig = {
  "co_roads": {
    "name": "Colorado Roads (No Data)",
    "type": "background",
    "defaultVisible": false,
    "styleProperties": ["background-color"]
  },
  "co_railways": {
    "name": "Colorado Railways (No Data)",
    "type": "background",
    "defaultVisible": false, 
    "styleProperties": ["background-color"]
  },
  "co_power_lines": {
    "name": "Power Lines (No Data)",
    "type": "background",
    "defaultVisible": false,
    "styleProperties": ["background-color"]
  }
};