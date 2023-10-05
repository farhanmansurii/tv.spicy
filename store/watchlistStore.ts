import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
interface ListState {
  watchlist: any;
  addToWatchlist: (shows: any) => void;
  removeFromWatchList: (id: number) => void;
}

export const useWatchListStore = create<ListState>((set) => ({
  watchlist: [],
  addToWatchlist: (show: any) =>
    set((state) => ({ watchlist: [show, ...state.watchlist] })),
  removeFromWatchList: (id: number) =>
    set((state) => ({
      watchlist: state.watchlist.filter((show: any) => show.id !== id),
    })),
}));
