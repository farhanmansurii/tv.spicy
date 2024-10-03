// TanstackQueryProvider.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { usePathname } from 'next/navigation';
import { Header } from '../common/header';
import MinimalSocialsFooter from '../common/Footer';

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

        const localStoragePersistor = createSyncStoragePersister({ storage: typeof window !== 'undefined' ? window.localStorage : null });

        persistQueryClient({
            queryClient: client,
            persister: localStoragePersistor,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return client;
    });

    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            const timestamp = new Date().toISOString();
            if (event.type === 'added' || event.type === 'updated') {
                console.log(`[${timestamp}] Query ${event.type}:`, event.query.queryKey);
                console.log(`[${timestamp}] Is data cached?`, !!event.query.state.data);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);
    const pathname = usePathname();
    return (
        <QueryClientProvider client={queryClient}>
                {pathname !== '/' && <Header />}
                {children}
                {pathname !== '/' && <MinimalSocialsFooter />}
                <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default QueryProvider;
