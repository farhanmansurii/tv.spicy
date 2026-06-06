'use client';

import { useMemo } from 'react';
import { useSession } from '@/lib/auth-client';

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	return 'evening';
};

export function usePersonalizedGreeting() {
	const { data: session } = useSession();

	const firstName = useMemo(() => {
		const name = session?.user?.name;
		if (!name) return null;
		return name.split(' ')[0];
	}, [session?.user?.name]);

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
		isAuthenticated: !!session?.user,
	};
}
