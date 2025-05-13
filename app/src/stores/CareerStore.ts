export type CareerKey = "fullstack" | "devops" | "uxui" | "projectmanager";

export const CareerStore = {
  selectedCareer: null as CareerKey | null,

  setCareer(key: CareerKey) {
    this.selectedCareer = key;
  },

  getCareer() {
    return this.selectedCareer;
  },

  reset() {
    this.selectedCareer = null;
  },
};
