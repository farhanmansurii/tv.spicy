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
	const [isVisible, setIsVisible] = useState(true);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const firstName = useMemo(() => {
		if (!session?.user?.name) return null;
		return session.user.name.split(' ')[0];
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
		if (messages.length === 0) return;
		setCurrentIndex((prev) => (prev + 1) % messages.length);
	}, [messages.length]);

	// Intersection Observer to pause when not visible
	useEffect(() => {
		if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
			return;
		}

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 }
		);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	// Message rotation timer
	useEffect(() => {
		if (messages.length === 0 || !isVisible) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		// Rotate every 3.5 seconds
		intervalRef.current = setInterval(() => {
			rotateMessage();
		}, 3500);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [messages.length, isVisible, rotateMessage]);

	return {
		message: currentMessage,
		firstName,
		isAuthenticated: !!session?.user,
		observerRef,
	};
}
