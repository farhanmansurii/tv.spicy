'use client';

import { useState, useEffect } from 'react';
import titles from './config.json';

type TimeKey =
	| 'morning'
	| 'afternoon'
	| 'evening'
	| 'night'
	| 'late_night'
	| 'weekend'
	| 'holiday'
	| '420'
	| 'weekday'
	| 'lazy_day';

type PlaceholderSet = {
	default: string[];
	unique: string[];
	subheading?: string[];
};

const getTimeKey = (): TimeKey => {
	const hour = new Date().getHours();

	if (hour >= 6 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	if (hour >= 17 && hour < 22) return 'evening';
	if (hour >= 22 || hour < 2) return 'late_night';
	return 'night';
};

const useTitle = () => {
	const [title, setTitle] = useState<string>('');
	const [timeKey, setTimeKey] = useState<TimeKey | null>(null);

	useEffect(() => {
		setTimeKey(getTimeKey());
	}, []);

	useEffect(() => {
		if (!timeKey) return;

		const placeholders: PlaceholderSet | undefined = (titles as Record<string, PlaceholderSet>)[
			timeKey
		];

		if (placeholders?.default?.length) {
			const random = Math.floor(Math.random() * placeholders.default.length);
			setTitle(placeholders.default[random]);
		}
	}, [timeKey]);

	return {
		title,
		timeKey,
		unique: titles?.[timeKey!]?.unique ?? [],
		subheadings: [],
	};
};

export default useTitle;
