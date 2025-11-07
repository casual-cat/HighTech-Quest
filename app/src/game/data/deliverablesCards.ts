export type DeliverableCard = {
  id: number;
  image: string;
  pairId: number;
  pairImage: string;
};

export type DeliverableCardMap = Record<number, DeliverableCard>;

export const DELIVERABLES_CARDS: DeliverableCardMap = {
  1: {
    id: 1,
    image: "card-1",
    pairId: 2,
    pairImage: "pair-1",
  },
  2: {
    id: 2,
    image: "card-2",
    pairId: 1,
    pairImage: "pair-1",
  },
  3: {
    id: 3,
    image: "card-3",
    pairId: 4,
    pairImage: "pair-2",
  },
  4: {
    id: 4,
    image: "card-4",
    pairId: 3,
    pairImage: "pair-2",
  },
  5: {
    id: 5,
    image: "card-5",
    pairId: 6,
    pairImage: "pair-3",
  },
  6: {
    id: 6,
    image: "card-6",
    pairId: 5,
    pairImage: "pair-3",
  },
  7: {
    id: 7,
    image: "card-7",
    pairId: 8,
    pairImage: "pair-4",
  },
  8: {
    id: 8,
    image: "card-8",
    pairId: 7,
    pairImage: "pair-4",
  },
};
