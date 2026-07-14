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
			router.push(`/search?q=${encodeURIComponent(value.trim())}`);
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
				'relative flex w-full items-center h-11',
				desktop ? 'rounded-xl px-3.5 gap-3' : 'rounded-xl px-3 gap-2',
				'bg-white/[0.04] hover:bg-white/[0.06] focus-within:bg-white/[0.08]',
				'border border-white/[0.08] hover:border-white/[0.12] focus-within:border-white/[0.16]',
				'transition-all duration-200 ease-out',
				className
			)}
		>
			<MagnifyingGlassIcon className="h-[18px] w-[18px] text-white/30 flex-shrink-0" />
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Search movies, shows..."
				className="flex-1 min-w-0 bg-transparent text-sm text-white/80 placeholder:text-white/30 outline-none"
			/>
			{showGoButton && value.trim() && (
				<button
					onClick={submit}
					className={cn(
						'flex-shrink-0 flex items-center justify-center',
						'h-7 px-2.5 rounded-full',
						'bg-white/[0.10] text-white/70',
						'hover:bg-white/[0.16] hover:text-white',
						'transition-all duration-200',
						'text-[11px] font-semibold'
					)}
				>
					Go
				</button>
			)}
			{showGoButton && !value.trim() && (
				<button
					onClick={submit}
					disabled
					className={cn(
						'flex-shrink-0 flex items-center justify-center',
						'h-7 w-7 rounded-full',
						'text-white/20',
						'cursor-default'
					)}
				>
					<ArrowRightIcon size={14} />
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
				className={cn(
					'flex items-center justify-center',
					'w-11 h-11',
					'text-white/60 hover:text-white/90',
					'transition-colors duration-200',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
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
				/* Mobile: full width pill */
				'flex-1 h-10 rounded-full px-3.5',
				/* Desktop: fixed width input */
				'lg:flex-none lg:w-80 lg:rounded-xl lg:px-4',
				className
			)}
			desktop
		/>
	);
}
