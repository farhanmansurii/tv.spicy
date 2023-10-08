import { StateCreator, create } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";

interface SearchState {
  searches: any[];
  addToSearchList: (show: any) => void;
  removeFromSearchList: (id: number) => void;
  clearSearchList: () => void;
}

type MyPersist = (
  config: StateCreator<SearchState>,
  options: PersistOptions<SearchState>
) => StateCreator<SearchState>;

const useRecentSearchStore = create<SearchState>(
  (persist as MyPersist)(
    (set) => ({
      searches: []?.slice(0, 4),
      addToSearchList: (show: any) =>
        set((state) => {
          if (state.searches.includes(show)) {
            return state;
          }
          return {
            searches: [show, ...state.searches].slice(0, 5),
          };
        }),

      removeFromSearchList: (id: number) =>
        set((state) => ({
          searches: state.searches.filter((show: any) => show.id !== id),
        })),
      clearSearchList: () => set((state) => ({ searches: [] })),
    }),
    {
      name: "spicy-tv-searches",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useRecentSearchStore;
