import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProviderStore {
	selectedProvider: string;
	setProvider: (provider: string) => void;
}

const useProviderStore = create<ProviderStore>()(
	persist(
		(set) => ({
			selectedProvider: '111movies',
			setProvider: (provider: string) => set({ selectedProvider: provider }),
		}),
		{
			name: 'watvg-provider-storage',
			getStorage: () => localStorage,
		}
	)
);

export default useProviderStore;
