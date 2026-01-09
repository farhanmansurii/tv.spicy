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
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

type MyPersist = (
  config: StateCreator<ListState>,
  options: PersistOptions<ListState>
) => StateCreator<ListState>;

const syncToDatabase = async (mediaType: 'movie' | 'tv', item: any, action: 'add' | 'remove') => {
  try {
    if (action === 'add') {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: item.id,
          mediaType,
          posterPath: item.poster_path,
          backdropPath: item.backdrop_path,
          title: item.title || item.name,
          overview: item.overview,
        }),
      });
    } else {
      await fetch(`/api/watchlist?mediaId=${item.id}&mediaType=${mediaType}`, {
        method: 'DELETE',
      });
    }
  } catch (error) {
    console.error('Error syncing to database:', error);
  }
};

const useWatchListStore = create<ListState>(
  (persist as MyPersist)(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: async (show: any) => {
        set((state) => ({ watchlist: [show, ...state.watchlist] }));
        await syncToDatabase('movie', show, 'add');
      },
      removeFromWatchList: async (id: number) => {
        const show = get().watchlist.find((s: any) => s.id === id);
        set((state) => ({
          watchlist: state.watchlist.filter((show: any) => show.id !== id),
        }));
        if (show) await syncToDatabase('movie', show, 'remove');
      },
      clearWatchlist: async () => {
        set((state) => ({ watchlist: [] }));
        await fetch('/api/watchlist?mediaType=movie', { method: 'DELETE' });
      },
      tvwatchlist: [],
      addToTvWatchlist: async (show: any) => {
        set((state) => ({ tvwatchlist: [show, ...state.tvwatchlist] }));
        await syncToDatabase('tv', show, 'add');
      },
      removeFromTvWatchList: async (id: number) => {
        const show = get().tvwatchlist.find((s: any) => s.id === id);
        set((state) => ({
          tvwatchlist: state.tvwatchlist.filter((show: any) => show.id !== id),
        }));
        if (show) await syncToDatabase('tv', show, 'remove');
      },
      clearTVWatchlist: async () => {
        set((state) => ({ tvwatchlist: [] }));
        await fetch('/api/watchlist?mediaType=tv', { method: 'DELETE' });
      },
      syncWithDatabase: async () => {
        const { watchlist, tvwatchlist } = get();
        for (const item of watchlist) {
          await syncToDatabase('movie', item, 'add');
        }
        for (const item of tvwatchlist) {
          await syncToDatabase('tv', item, 'add');
        }
      },
      loadFromDatabase: async () => {
        try {
          const [moviesResponse, tvResponse] = await Promise.all([
            fetch('/api/watchlist?type=movie'),
            fetch('/api/watchlist?type=tv'),
          ]);

          if (!moviesResponse.ok || !tvResponse.ok) {
            throw new Error('Failed to fetch watchlist');
          }

          const movies = await moviesResponse.json();
          const tv = await tvResponse.json();

          // Convert database format to local format
          const convertToLocalFormat = (item: any) => ({
            id: item.mediaId,
            title: item.title,
            name: item.title,
            poster_path: item.posterPath,
            backdrop_path: item.backdropPath,
            overview: item.overview,
            media_type: item.mediaType.toLowerCase(),
          });

          const localMovies = movies.map(convertToLocalFormat);
          const localTV = tv.map(convertToLocalFormat);

          set({ watchlist: localMovies, tvwatchlist: localTV });
        } catch (error) {
          console.error('Error loading from database:', error);
        }
      },
    }),
    {
      name: "watchlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWatchListStore;
