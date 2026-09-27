import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PROVIDER_ID } from '@/components/features/media/episode/providers/registry';

interface ProviderStore {
	selectedProvider: string;
	setProvider: (provider: string) => void;
}

const useProviderStore = create<ProviderStore>()(
	persist(
		(set) => ({
			selectedProvider: DEFAULT_PROVIDER_ID,
			setProvider: (provider: string) => set({ selectedProvider: provider }),
		}),
		{
			name: 'watvg-provider-storage',
			storage: createJSONStorage(() => localStorage),
			version: 1,
			// v0 stored the old default for everyone, so it says nothing about a real choice.
			migrate: (persisted, version) => {
				const state = persisted as Pick<ProviderStore, 'selectedProvider'>;
				return version < 1 && state?.selectedProvider === 'vidfast'
					? { ...state, selectedProvider: DEFAULT_PROVIDER_ID }
					: state;
			},
		}
	)
);

export default useProviderStore;
