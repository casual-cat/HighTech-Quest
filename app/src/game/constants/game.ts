// World Configuration
export const WORLD = {
  WIDTH: 1280,
  HEIGHT: 736,
  TILE: {
    WIDTH: 32,
    HEIGHT: 32,
  },
} as const;

// Character Configuration
export const CHARACTER = {
  SPEED: 160,
  HEALTH: {
    MAX: 100,
  },
  INTERACTION_DISTANCE: 48,
} as const;

// UI Configuration
export const UI = {
  HEALTH_BAR: {
    DIMENSIONS: {
      HEIGHT: 24,
      RADIUS: 12,
      LINE_WIDTH: 1,
      ICON_OFFSET: 48,
    },
    STYLE: {
      FONT_SIZE: "14px",
      FONT_FAMILY: "Arial, sans-serif",
    },
    COLORS: {
      BACKGROUND: 0x888888,
      FULL_HEALTH: 0x1bd5d3,
      LOW_HEALTH: 0x39cd68,
      NO_HEALTH: 0x5f0cc0,
    },
  },
} as const;

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: 0x9b4dca, // Purple
    TEXT: {
      PRIMARY: "#ffffff",
    },
  },
} as const;
