import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQuery } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { fetchRowData } from './api';

/**
 * Utility Functions
 * For UI helpers, formatting, and client-side utilities
 */

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Get Lucide icon by name
 */
export function getLucideIcon(iconName: string) {
	return Icons[iconName as keyof typeof Icons] || Icons.Circle;
}

/**
 * Format relative time (e.g., "2 days", "1 day", "5 hours")
 */
export function formatRelativeTime(airDate: string): string {
	const now = new Date();
	const episodeDate = new Date(airDate);
	const timeDifference = episodeDate.getTime() - now.getTime();
	const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
	if (daysDifference > 1) {
		return `${daysDifference} days`;
	} else if (daysDifference === 1) {
		return '1 day';
	} else {
		const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
		if (hoursDifference >= 0) return `${hoursDifference} hours`;
		else return '';
	}
}

/**
 * React Query hook for row data (client-side)
 */
export function useRowData(link: string) {
	return useQuery({
		queryKey: ['rowData', link],
		queryFn: () => fetchRowData(link),
		staleTime: 1000 * 60 * 60 * 24, // 24h
		gcTime: 1000 * 60 * 60 * 24, // 24h
	});
}
