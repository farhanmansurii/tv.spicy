'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	return 'evening';
};

export function usePersonalizedGreeting() {
	const name = useAuthStore((state) => state.userName);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const firstName = useMemo(() => {
		if (!name) return null;
		return name.split(' ')[0];
	}, [name]);

	const message = useMemo(() => {
		if (!firstName) return null;
		const timeOfDay = getTimeOfDay();
		const timeGreeting =
			timeOfDay === 'morning'
				? 'Good morning'
				: timeOfDay === 'afternoon'
					? 'Good afternoon'
					: 'Good evening';
		return `${timeGreeting}, ${firstName}`;
	}, [firstName]);

	return {
		message,
		firstName,
		isAuthenticated,
	};
}
