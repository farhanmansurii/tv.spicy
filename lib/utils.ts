import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [
				'text-display',
				'text-title',
				'text-lede',
				'text-body',
				'text-ui',
				'text-small',
				'text-caption',
				'text-micro',
			],
			'text-color': [
				'text-text',
				'text-soft',
				'text-dim',
				'text-faint',
				'text-brand',
				'text-brand-hover',
				'text-brand-foreground',
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return customTwMerge(clsx(inputs));
}
