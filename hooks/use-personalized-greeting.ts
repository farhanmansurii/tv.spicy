'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth-client';

interface GreetingMessage {
	text: string;
	timeBased?: boolean;
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	return 'evening';
};

const generateMessages = (firstName: string): GreetingMessage[] => {
	const timeOfDay = getTimeOfDay();
	const timeGreeting = timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : 'Good evening';

	return [
		{ text: `Hello ${firstName}` },
		{ text: `Welcome back, ${firstName}` },
		{ text: `${timeGreeting}, ${firstName}`, timeBased: true },
		{ text: `Ready to watch, ${firstName}?` },
		{ text: `What will you watch today, ${firstName}?` },
		{ text: `Let's find something great, ${firstName}` },
		{ text: `Your next favorite is waiting, ${firstName}` },
		{ text: `Discover something new, ${firstName}` },
	];
};

export function usePersonalizedGreeting() {
	const { data: session } = useSession();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [hasRotated, setHasRotated] = useState(false);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const hasRotatedRef = useRef(false);

	const firstName = useMemo(() => {
		const name = session?.user?.name;
		if (!name) return null;
		return name.split(' ')[0];
	}, [session?.user?.name]);

	const messages = useMemo(() => {
		if (!firstName) return [];
		return generateMessages(firstName);
	}, [firstName]);

	const currentMessage = useMemo(() => {
		if (messages.length === 0) return null;
		return messages[currentIndex]?.text || messages[0]?.text;
	}, [messages, currentIndex]);

	const rotateMessage = useCallback(() => {
		if (messages.length === 0 || hasRotatedRef.current) return;
		setCurrentIndex((prev) => {
			const nextIndex = (prev + 1) % messages.length;
			hasRotatedRef.current = true;
			setHasRotated(true);
			return nextIndex;
		});
	}, [messages.length]);

	// Rotate message once on mount/refresh
	useEffect(() => {
		if (messages.length === 0 || hasRotatedRef.current) return;

		// Rotate once after a short delay (e.g., 2 seconds)
		intervalRef.current = setTimeout(() => {
			rotateMessage();
		}, 2000);

		return () => {
			if (intervalRef.current) {
				clearTimeout(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [messages.length, rotateMessage]);

	return {
		message: currentMessage,
		firstName,
		isAuthenticated: !!session?.user,
	};
}
