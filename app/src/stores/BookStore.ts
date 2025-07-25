import { BookManager } from "../managers/BookManager";

let bookManager: BookManager | undefined;

export const BookStore = {
  get: () => bookManager,
  set: (bm: BookManager) => {
    bookManager = bm;
  },
};
