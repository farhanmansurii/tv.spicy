import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [
				'text-display-1',
				'text-display-1-long',
				'text-display-1-extended',
				'text-display-1-maximum',
				'text-display-2',
				'text-display-3',
				'text-display-4',
				'text-lede',
				'text-body',
				'text-title',
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
