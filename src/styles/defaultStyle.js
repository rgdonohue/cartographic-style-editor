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
    "colorado_highways": {
      "type": "vector",
      "url": "pmtiles://assets/tiles/colorado_highways.pmtiles"
    },
    "colorado_rivers": {
      "type": "vector",
      "url": "pmtiles://assets/tiles/colorado_rivers.pmtiles"
    },
    "colorado_rails": {
      "type": "vector",
      "url": "pmtiles://assets/tiles/colorado_rails.pmtiles"
    },
    "osm_points": {
      "type": "vector",
      "url": "pmtiles://assets/tiles/osm_points.pmtiles"
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
      "id": "colorado_rivers",
      "type": "line",
      "source": "colorado_rivers",
      "source-layer": "rivers",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#2196F3",
        "line-width": 2,
        "line-opacity": 0.8
      }
    },
    {
      "id": "colorado_rails",
      "type": "line",
      "source": "colorado_rails",
      "source-layer": "rails",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#795548",
        "line-width": 2,
        "line-opacity": 0.7,
        "line-dasharray": [3, 3]
      }
    },
    {
      "id": "colorado_highways",
      "type": "line",
      "source": "colorado_highways",
      "source-layer": "highways",
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "#FF5722",
        "line-width": 3,
        "line-opacity": 0.9
      }
    },
    {
      "id": "osm_points",
      "type": "circle",
      "source": "osm_points",
      "source-layer": "points",
      "layout": {
        "visibility": "visible"
      },
      "paint": {
        "circle-color": "#4CAF50",
        "circle-radius": 4,
        "circle-opacity": 0.8,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1
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
  "colorado_highways": {
    "name": "Colorado Highways",
    "type": "line",
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  },
  "colorado_rivers": {
    "name": "Colorado Rivers",
    "type": "line", 
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  },
  "colorado_rails": {
    "name": "Colorado Rails",
    "type": "line",
    "defaultVisible": true,
    "styleProperties": ["line-color", "line-width", "line-opacity"]
  },
  "osm_points": {
    "name": "Points of Interest",
    "type": "circle",
    "defaultVisible": true,
    "styleProperties": ["circle-color", "circle-radius", "circle-opacity"]
  }
};