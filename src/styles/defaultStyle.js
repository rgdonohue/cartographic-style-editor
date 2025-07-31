/**
 * Default MapLibre style configuration for Colorado infrastructure data
 * This will be used as the base style for the application
 */

export const defaultStyle = {
  "version": 8,
  "name": "Map Remix Default",
  "metadata": {
    "mapbox:autocomposite": false,
    "mapbox:type": "template"
  },
  "sources": {
    "co_roads": {
      "type": "vector",
      "url": "pmtiles://../assets/tiles/co_roads.pmtiles"
    },
    "co_railways": {
      "type": "vector",
      "url": "pmtiles://../assets/tiles/co_railways.pmtiles"
    },
    "co_power_lines": {
      "type": "vector",
      "url": "pmtiles://../assets/tiles/co_power_lines.pmtiles"
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
      "id": "co_railways",
      "type": "line",
      "source": "co_railways",
      "source-layer": "railways",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#795548",
        "line-width": 2,
        "line-opacity": 0.8,
        "line-dasharray": [4, 2]
      }
    },
    {
      "id": "co_power_lines",
      "type": "line",
      "source": "co_power_lines",
      "source-layer": "power_lines",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#9C27B0",
        "line-width": 1.5,
        "line-opacity": 0.7,
        "line-dasharray": [2, 4]
      }
    },
    {
      "id": "co_roads",
      "type": "line",
      "source": "co_roads",
      "source-layer": "roads",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#FF5722",
        "line-width": 2.5,
        "line-opacity": 0.9
      }
    }
  ],
  "center": [-105.7821, 39.7391],
  "zoom": 7,
  "bearing": 0,
  "pitch": 0
};

/**
 * Layer configuration metadata for UI controls
 */
export const layerConfig = {
  "co_roads": {
    "name": "Colorado Roads",
    "type": "line",
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  },
  "co_railways": {
    "name": "Colorado Railways",
    "type": "line",
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  },
  "co_power_lines": {
    "name": "Power Lines",
    "type": "line",
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  }
};