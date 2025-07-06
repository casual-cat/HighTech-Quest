export const BOOK_LEVELS_LAYOUT = {
  pageY: 44,
  leftPageX: 82,
  rightPageX: 642,
  titleYOffset: 40,
  titleXOffset: 50,
  starSpacing: 60,
  leftStarsX: 197, // leftPageX + 115
  rightStarsX: 767, // leftPageX + 685
  starsY: 334, // pageY + 290
  lockXOffset: 245,
  lockYOffset: 254,
};

export const BOOK_SCENE_CONFIG = {
  OVERLAY: {
    COLOR: 0x000000,
    ALPHA: 0.7,
  },
  TEXT: {
    STYLE: {
      fontSize: "16px",
    },
    COLORS: {
      NEW: "#9b59b6",
      VIEWED: "#000000",
    },
    SPACING: 50,
  },
} as const;
