'use client';

import { QueryClient } from '@tanstack/react-query';
import type { PersonalizedHomeData } from '@/lib/types/personalized-home';

// Global query client instance - will be set by the provider
let queryClientInstance: QueryClient | null = null;

export function setQueryClient(client: QueryClient | null) {
	queryClientInstance = client;
}

export function getQueryClient(): QueryClient | null {
	return queryClientInstance;
}

export function updatePersonalizedHomeQuery(
	userId: string,
	updater: (data: PersonalizedHomeData) => PersonalizedHomeData
): void {
	queryClientInstance?.setQueryData<PersonalizedHomeData>(
		['user', userId, 'personalized-home'],
		(current) => (current ? updater(current) : current)
	);
}
