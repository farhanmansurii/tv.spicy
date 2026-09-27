import React from 'react';
import { cn } from '@/lib/utils';

const NON_LATIN_REGEX = /[^\u0000-\u024f\s\d.,!?&:'’()-]/u;

export interface TitleParts {
	main: string;
	subtitle: string;
	isNonLatin: boolean;
	tierClass: string;
	tierModifier: string;
}

export function parseTitleParts(title: string): TitleParts {
	const parts = title.split(/: | – /);
	const main = parts[0] ?? '';
	const subtitle = parts.length > 1 ? parts.slice(1).join(' – ') : '';
	const isNonLatin = NON_LATIN_REGEX.test(main);

	let tierClass = 'text-display-1';
	let tierModifier = '';
	if (main.length > 48) {
		tierClass = 'text-display-1-maximum';
		tierModifier = 'is-maximum';
	} else if (main.length > 28) {
		tierClass = 'text-display-1-extended';
		tierModifier = 'is-extended';
	} else if (main.length > 14) {
		tierClass = 'text-display-1-long';
		tierModifier = 'is-long';
	}

	return { main, subtitle, isNonLatin, tierClass, tierModifier };
}

export interface TitleDisplayProps {
	title: string;
	originalTitle?: string;
	as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
	id?: string;
	className?: string;
	splitWords?: boolean;
}

export function TitleDisplay({
	title,
	originalTitle,
	as: Component = 'h1',
	id,
	className,
	splitWords = false,
}: TitleDisplayProps) {
	const { main, subtitle, isNonLatin, tierClass, tierModifier } = parseTitleParts(title);

	const renderMainContent = () => {
		if (isNonLatin || !splitWords) {
			return main;
		}

		const words = main.split(/\s+/);
		return words.map((word, index) => (
			<React.Fragment key={index}>
				<span className="dv-title-word inline-block overflow-hidden align-top">
					<span className="dv-title-inner inline-block">{word}</span>
				</span>
				{index < words.length - 1 ? ' ' : null}
			</React.Fragment>
		));
	};

	return (
		<Component
			id={id}
			aria-label={title}
			className={cn(
				'dv-title m-0 text-balance break-anywhere tracking-normal',
				tierClass,
				tierModifier,
				isNonLatin
					? 'is-nonlatin font-sans font-bold leading-nonlatin normal-case text-text'
					: 'font-display uppercase text-text',
				className
			)}
		>
			<span className="dv-title-main inline">{renderMainContent()}</span>
			{subtitle ? (
				<span className="dv-title-subtitle block mt-3 font-display uppercase text-display-3 tracking-normal text-text">
					{subtitle}
				</span>
			) : null}
			{originalTitle && originalTitle !== title ? (
				<span className="dv-title-original block mt-3 font-mono uppercase text-caption text-dim tracking-label tabular-nums">
					{originalTitle}
				</span>
			) : null}
		</Component>
	);
}
