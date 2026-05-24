'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useMediaQueryStore } from '@/store/mediaQueryStore';
import { setQueryClient } from '@/lib/query-client';

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 60 * 24,
						gcTime: 1000 * 60 * 60 * 24 * 7,
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
					},
				},
			})
	);

	// Wire localStorage persistence only in the browser — never during SSR
	useEffect(() => {
		const localStoragePersistor = createSyncStoragePersister({
			storage: window.localStorage,
		});
		persistQueryClient({
			queryClient,
			persister: localStoragePersistor,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
	}, [queryClient]);

	// Initialize media query store
	const initMediaQuery = useMediaQueryStore((state) => state.init);
	useEffect(() => {
		initMediaQuery();
	}, [initMediaQuery]);

	// Set global query client instance
	useEffect(() => {
		setQueryClient(queryClient);
	}, [queryClient]);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
};

export default QueryProvider;
