// World Configuration
export const WORLD = {
  WIDTH: 2560,
  HEIGHT: 1280,
  TILE: {
    WIDTH: 32,
    HEIGHT: 32,
  },
} as const;

// Player Configuration
export const PLAYER = {
  SPEED: 160,
  HEALTH: {
    MAX: 100,
  },
} as const;

// UI Configuration
export const UI = {
  HEALTH_BAR: {
    DIMENSIONS: {
      HEIGHT: 24,
      RADIUS: 12,
      LINE_WIDTH: 1,
      ICON_OFFSET: 24,
    },
    STYLE: {
      FONT_SIZE: "14px",
      FONT_FAMILY: "Arial, sans-serif",
    },
    COLORS: {
      BACKGROUND: 0x888888,
      FILL: 0x9b4dca, // PRIMARY
      LOW_HEALTH: 0xff6600,
      BORDER: 0x9b4dca, // PRIMARY
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
