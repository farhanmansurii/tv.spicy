'use client';

import { QueryClient } from '@tanstack/react-query';

// Global query client instance - will be set by the provider
let queryClientInstance: QueryClient | null = null;

export function setQueryClient(client: QueryClient | null) {
	queryClientInstance = client;
}

export function getQueryClient(): QueryClient | null {
	return queryClientInstance;
}

export function invalidateUserQueries(userId?: string) {
	if (!queryClientInstance) {
		return;
	}

	if (userId) {
		// Invalidate all user-specific queries
		queryClientInstance.invalidateQueries({ queryKey: ['user', userId] });
	} else {
		// Invalidate all user queries
		queryClientInstance.invalidateQueries({ queryKey: ['user'] });
	}
}
