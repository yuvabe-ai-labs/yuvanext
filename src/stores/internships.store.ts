import { create } from "zustand";
import type { Internship } from "@/types/internships.types";

interface InternshipStore {
  selectedInternship: Internship | null;
  setSelectedInternship: (internship: Internship | null) => void;
  clearSelectedInternship: () => void;
}

export const useInternshipStore = create<InternshipStore>((set) => ({
  selectedInternship: null,

  setSelectedInternship: (internship) =>
    set({ selectedInternship: internship }),

  clearSelectedInternship: () => set({ selectedInternship: null }),
}));
