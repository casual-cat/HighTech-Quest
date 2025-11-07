export type DeliverableCard = {
  id: number;
  image: string;
  pairId: number;
};

export type DeliverableCardMap = Record<number, DeliverableCard>;

export const DELIVERABLES_CARDS: DeliverableCardMap = {
  1: {
    id: 1,
    image: "card1",
    pairId: 2,
  },
  2: {
    id: 2,
    image: "card2",
    pairId: 1,
  },
  3: {
    id: 3,
    image: "card3",
    pairId: 4,
  },
  4: {
    id: 4,
    image: "card4",
    pairId: 3,
  },
  5: {
    id: 5,
    image: "card5",
    pairId: 6,
  },
  6: {
    id: 6,
    image: "card6",
    pairId: 5,
  },
  7: {
    id: 7,
    image: "card7",
    pairId: 8,
  },
  8: {
    id: 8,
    image: "card8",
    pairId: 7,
  },
};
