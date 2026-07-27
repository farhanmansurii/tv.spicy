'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { PersonalizedHomeData } from '@/lib/types/personalized-home';

const fetchPersonalizedHome = async (): Promise<PersonalizedHomeData> => {
	const response = await fetch('/api/home/personalized', { credentials: 'include' });
	if (!response.ok) throw new Error('Failed to fetch personalized home data');
	return response.json();
};

export function usePersonalizedHome() {
	const userId = useAuthStore((state) => state.userId);
	const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

	return useQuery({
		queryKey: ['user', userId, 'personalized-home'],
		queryFn: fetchPersonalizedHome,
		enabled: !!userId && !isBootstrapping,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 1,
	});
}
