export const ANIMATION_CONFIG = {
  BACKGROUND: {
    SCALE: { from: 0, to: 1 },
    DURATION: 500,
    EASE: "Back.easeOut"
  },
  PIECE: {
    HOVER: {
      SCALE: 1.2,
      DURATION: 200,
      EASE: "Power2"
    },
    SELECT: {
      SCALE: 1.5,
      DURATION: 600,
      EASE: "Power2"
    },
    SHAKE: {
      OFFSET: 10,
      DURATION: 50,
      REPEAT: 2,
      EASE: "Sine.easeInOut"
    },
    FADE: {
      DURATION: 300,
      DELAY: 200,
      EASE: "Back.easeOut"
    }
  },
  BOOK: {
    POSITION: { x: 16 * 8, y: 16 * 3 },
    MOVE_DURATION: 1000,
    EASE: "Power2.out"
  }
}; 