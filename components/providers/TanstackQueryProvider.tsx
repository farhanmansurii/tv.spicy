// TanstackQueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { usePathname } from 'next/navigation';
import { Header } from '../common/header';
import MinimalSocialsFooter from '../common/Footer';
import NavigationProvider from './SidebarProvider';

const QueryProvider = ({ children, genres }: { children: React.ReactNode; genres: any }) => {
	const [queryClient] = useState(() => {
		const client = new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 1000 * 60 * 60 * 24, // 24 hours
					gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
					refetchOnWindowFocus: false,
					refetchOnReconnect: false,
				},
			},
		});

		const localStoragePersistor = createSyncStoragePersister({
			storage: typeof window !== 'undefined' ? window.localStorage : null,
		});

		persistQueryClient({
			queryClient: client,
			persister: localStoragePersistor,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		return client;
	});

	return (
		<QueryClientProvider client={queryClient}>
			<NavigationProvider genres={genres}>
				<Header />
				{children}
				<MinimalSocialsFooter />
				<ReactQueryDevtools initialIsOpen={false} />
			</NavigationProvider>
		</QueryClientProvider>
	);
};

export default QueryProvider;
