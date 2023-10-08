import { StateCreator, create } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";

interface ListState {
  watchlist: any[];
  addToWatchlist: (show: any) => void;
  removeFromWatchList: (id: number) => void;
  clearWatchlist: () => void;
  clearTVWatchlist: () => void;
  tvwatchlist: any[];
  addToTvWatchlist: (show: any) => void;
  removeFromTvWatchList: (id: number) => void;
}

type MyPersist = (
  config: StateCreator<ListState>,
  options: PersistOptions<ListState>
) => StateCreator<ListState>;

const useWatchListStore = create<ListState>(
  (persist as MyPersist)(
    (set) => ({
      watchlist: [],
      addToWatchlist: (show: any) =>
        set((state) => ({ watchlist: [show, ...state.watchlist] })),
      removeFromWatchList: (id: number) =>
        set((state) => ({
          watchlist: state.watchlist.filter((show: any) => show.id !== id),
        })),
      clearWatchlist: () => set((state) => ({ watchlist: [] })),
      tvwatchlist: [],
      addToTvWatchlist: (show: any) =>
        set((state) => ({ tvwatchlist: [show, ...state.tvwatchlist] })),
      removeFromTvWatchList: (id: number) =>
        set((state) => ({
          tvwatchlist: state.tvwatchlist.filter((show: any) => show.id !== id),
        })),
      clearTVWatchlist: () => set((state) => ({ tvwatchlist: [] })),
    }),
    {
      name: "watchlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWatchListStore;
