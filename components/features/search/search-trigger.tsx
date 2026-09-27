'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

/* ── Global ⌘K shortcut to /search ── */
function useSearchShortcut() {
	const router = useRouter();
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				router.push('/search');
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [router]);
}

// ── SearchInput (actual text input, navigates on Enter or Go click) ──

interface SearchInputProps {
	className?: string;
	showGoButton?: boolean;
	desktop?: boolean;
}

function SearchInput({ className, showGoButton, desktop }: SearchInputProps) {
	const router = useRouter();
	const { setOpenMobile } = useSidebar();
	const [value, setValue] = React.useState('');

	const submit = () => {
		if (value.trim()) {
			router.push(`/search?query=${encodeURIComponent(value.trim())}`);
			setValue('');
			if (showGoButton) setOpenMobile(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') submit();
	};

	return (
		<div
			className={cn(
				'relative flex h-11 w-full items-center rounded-sm border border-border-strong bg-card',
				desktop ? 'gap-3 px-3.5' : 'gap-2 px-3',
				'transition-[background-color,border-color] duration-(--duration-ui) motion-reduce:transition-none',
				'focus-within:border-brand',
				className
			)}
		>
			<MagnifyingGlassIcon className="size-4.5 shrink-0 text-muted-foreground" />
			<input
				type="text"
				autoComplete="off"
				spellCheck={false}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Search movies, shows..."
				className="min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
			/>
			{showGoButton && (
				<button
					type="button"
					onClick={submit}
					disabled={!value.trim()}
					aria-label="Search"
					className={cn(
						'flex h-7 shrink-0 items-center justify-center rounded-full px-2.5',
						'text-xs font-semibold transition-[color,background-color,border-color] duration-(--duration-ui) motion-reduce:transition-none',
						'border border-border-strong bg-card text-foreground',
						'can-hover:border-foreground/25 can-hover:bg-muted',
						'disabled:pointer-events-none disabled:border-transparent disabled:bg-transparent disabled:text-dim'
					)}
				>
					{value.trim() ? (
						'Go'
					) : (
						<ArrowRightIcon size={14} aria-hidden="true" />
					)}
				</button>
			)}
		</div>
	);
}

interface SearchTriggerProps {
	variant?: 'default' | 'expanded' | 'icon';
	className?: string;
}

export function SearchTrigger({ variant = 'default', className }: SearchTriggerProps) {
	useSearchShortcut();

	if (variant === 'icon') {
		return (
			<Link
				href="/search"
				prefetch={false}
				className={cn(
					'flex size-11 items-center justify-center',
					'text-muted-foreground can-hover:text-foreground',
					'transition-colors duration-(--duration-ui) motion-reduce:transition-none',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
					'touch-manipulation select-none',
					className
				)}
				aria-label="Search"
			>
				<MagnifyingGlassIcon size={20} weight="bold" />
			</Link>
		);
	}

	if (variant === 'expanded') {
		return <SearchInput className={className} showGoButton />;
	}

	// Default: desktop search input
	return (
		<SearchInput
			className={cn(
				'flex-1 h-10 px-3.5',
				'lg:w-80 lg:flex-none lg:px-4',
				className
			)}
			desktop
		/>
	);
}
