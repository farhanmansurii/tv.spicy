import { Show } from "@/lib/types";
import { create } from "zustand";

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  shows: Show[];
  setShows: (shows: Show[]) => void;
  loading: boolean; // Corrected the type to boolean
  setLoading: (loading: boolean) => void; // Corrected the parameter name
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  setQuery: (query: string) => set(() => ({ query })),
  shows: [],
  setShows: (shows: Show[]) => set(() => ({ shows })),
  loading: false, 
  setLoading: (loading: boolean) => set(() => ({ loading })), // Corrected the parameter name and implementation
}));
