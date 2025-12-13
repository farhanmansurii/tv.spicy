'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Header } from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';
import SidebarProvider from './sidebar-provider';

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
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
			<Header />
			{children}
			<Footer />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};

export default QueryProvider;
