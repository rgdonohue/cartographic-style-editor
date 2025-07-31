/**
 * Theme presets for Map Remix
 * Contains curated style themes as specified in the PRD
 */

export const themes = {
  default: {
    name: 'Default',
    description: 'Clean, modern cartographic style',
    background: {
      'background-color': '#f8f9fa'
    },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#FF5722',
          'line-width': 2.5,
          'line-opacity': 0.9
        }
      },
      co_railways: {
        paint: {
          'line-color': '#795548',
          'line-width': 2,
          'line-opacity': 0.8
        }
      },
      co_power_lines: {
        paint: {
          'line-color': '#9C27B0',
          'line-width': 1.5,
          'line-opacity': 0.7
        }
      }
    }
  },

  retro: {
    name: 'Retro',
    description: 'Vintage-inspired earth tones',
    background: {
      'background-color': '#f4f1e8'
    },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#8B4513',
          'line-width': 3,
          'line-opacity': 0.85
        }
      },
      co_railways: {
        paint: {
          'line-color': '#2F4F4F',
          'line-width': 2,
          'line-opacity': 0.8
        }
      },
      co_power_lines: {
        paint: {
          'line-color': '#DAA520',
          'line-width': 1.5,
          'line-opacity': 0.75
        }
      }
    }
  },

  night: {
    name: 'Night',
    description: 'Dark theme with neon accents',
    background: {
      'background-color': '#1a1a1a'
    },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#00FFFF',
          'line-width': 3,
          'line-opacity': 0.9
        }
      },
      co_railways: {
        paint: {
          'line-color': '#FF69B4',
          'line-width': 2,
          'line-opacity': 0.8
        }
      },
      co_power_lines: {
        paint: {
          'line-color': '#FFFF00',
          'line-width': 1.5,
          'line-opacity': 0.9
        }
      }
    }
  },

  terrain: {
    name: 'Terrain',
    description: 'Natural colors inspired by topographic maps',
    background: {
      'background-color': '#f0f8e8'
    },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#8B0000',
          'line-width': 3,
          'line-opacity': 0.8
        }
      },
      co_railways: {
        paint: {
          'line-color': '#8B4513',
          'line-width': 2,
          'line-opacity': 0.7
        }
      },
      co_power_lines: {
        paint: {
          'line-color': '#228B22',
          'line-width': 1.5,
          'line-opacity': 0.8
        }
      }
    }
  },

  minimal: {
    name: 'Minimal',
    description: 'Clean, high-contrast design',
    background: {
      'background-color': '#ffffff'
    },
    layers: {
      co_roads: {
        paint: {
          'line-color': '#000000',
          'line-width': 2,
          'line-opacity': 1.0
        }
      },
      co_railways: {
        paint: {
          'line-color': '#333333',
          'line-width': 1.5,
          'line-opacity': 0.8
        }
      },
      co_power_lines: {
        paint: {
          'line-color': '#666666',
          'line-width': 1,
          'line-opacity': 0.6
        }
      }
    }
  }
};

/**
 * Get theme by name
 * @param {string} themeName - Theme name
 * @returns {Object|null} Theme object or null if not found
 */
export function getTheme(themeName) {
  return themes[themeName] || null;
}

/**
 * Get all available theme names
 * @returns {string[]} Array of theme names
 */
export function getThemeNames() {
  return Object.keys(themes);
}

/**
 * Check if theme exists
 * @param {string} themeName - Theme name to check
 * @returns {boolean} True if theme exists
 */
export function hasTheme(themeName) {
  return themeName in themes;
}