'use client';

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { gsap } from 'gsap';
import { useHaptics } from '@/hooks/use-haptics';
import { isReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface TabItem {
	id: string;
	label: React.ReactNode;
	content?: React.ReactNode;
	disabled?: boolean;
}

interface EditorialTabsContextValue {
	activeTab: string;
	setActiveTab: (id: string, userInitiated?: boolean) => void;
	baseId: string;
	registerTrigger: (id: string, el: HTMLButtonElement | null) => void;
	listRef: React.RefObject<HTMLDivElement | null>;
	markerRef: React.RefObject<HTMLSpanElement | null>;
	updateMarker: (tabEl: HTMLElement, animate: boolean) => void;
}

const EditorialTabsContext = createContext<EditorialTabsContextValue | null>(null);

function useEditorialTabs() {
	const ctx = useContext(EditorialTabsContext);
	if (!ctx) {
		throw new Error('EditorialTabs components must be used within an EditorialTabs root');
	}
	return ctx;
}

export interface EditorialTabsProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	tabs?: TabItem[];
	ariaLabel?: string;
	className?: string;
	children?: React.ReactNode;
}

export function EditorialTabs({
	value: controlledValue,
	defaultValue,
	onValueChange,
	tabs,
	ariaLabel = 'Sections',
	className,
	children,
}: EditorialTabsProps) {
	const initialTab = controlledValue ?? defaultValue ?? tabs?.[0]?.id ?? '';
	const [uncontrolledValue, setUncontrolledValue] = useState(initialTab);
	const activeTab = controlledValue !== undefined ? controlledValue : uncontrolledValue;

	const baseId = useId();
	const listRef = useRef<HTMLDivElement | null>(null);
	const markerRef = useRef<HTMLSpanElement | null>(null);
	const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
	const haptic = useHaptics();

	const registerTrigger = useCallback((id: string, el: HTMLButtonElement | null) => {
		if (el) triggersRef.current.set(id, el);
		else triggersRef.current.delete(id);
	}, []);

	const updateMarker = useCallback((tabEl: HTMLElement, animate: boolean) => {
		if (!markerRef.current || !listRef.current) return;
		const x = tabEl.offsetLeft - listRef.current.scrollLeft;
		const width = tabEl.offsetWidth;
		const reduced = isReducedMotion();

		if (animate && !reduced) {
			gsap.to(markerRef.current, {
				x,
				scaleX: width,
				duration: 0.4,
				ease: 'power3.inOut',
			});
		} else {
			gsap.killTweensOf(markerRef.current);
			markerRef.current.style.transform = `translateX(${x}px) scaleX(${width})`;
		}
	}, []);

	const setActiveTab = useCallback(
		(id: string, userInitiated = false) => {
			if (userInitiated) haptic('selection');
			if (controlledValue === undefined) setUncontrolledValue(id);
			onValueChange?.(id);

			const el = triggersRef.current.get(id);
			if (el) updateMarker(el, userInitiated);
		},
		[controlledValue, onValueChange, haptic, updateMarker]
	);

	useEffect(() => {
		const el = triggersRef.current.get(activeTab);
		if (el) {
			const frame = requestAnimationFrame(() => updateMarker(el, false));
			return () => cancelAnimationFrame(frame);
		}
	}, [activeTab, updateMarker]);

	const contextValue: EditorialTabsContextValue = {
		activeTab,
		setActiveTab,
		baseId,
		registerTrigger,
		listRef,
		markerRef,
		updateMarker,
	};

	if (tabs && tabs.length > 0) {
		return (
			<EditorialTabsContext.Provider value={contextValue}>
				<div className={cn('w-full', className)}>
					<EditorialTabList ariaLabel={ariaLabel}>
						{tabs.map((tab) => (
							<EditorialTabTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
								{tab.label}
							</EditorialTabTrigger>
						))}
					</EditorialTabList>
					{tabs.map((tab) =>
						tab.content ? (
							<EditorialTabContent key={tab.id} value={tab.id}>
								{tab.content}
							</EditorialTabContent>
						) : null
					)}
				</div>
			</EditorialTabsContext.Provider>
		);
	}

	return (
		<EditorialTabsContext.Provider value={contextValue}>
			<div className={cn('w-full', className)}>{children}</div>
		</EditorialTabsContext.Provider>
	);
}

export interface EditorialTabListProps {
	ariaLabel?: string;
	className?: string;
	children: React.ReactNode;
}

export function EditorialTabList({
	ariaLabel = 'Navigation Tabs',
	className,
	children,
}: EditorialTabListProps) {
	const { listRef, markerRef, updateMarker, setActiveTab } = useEditorialTabs();
	const [fadeClass, setFadeClass] = useState('');

	const updateMask = useCallback(() => {
		const el = listRef.current;
		if (!el) return;

		const hasLeft = el.scrollLeft > 2;
		const hasRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;

		if (hasLeft && hasRight) {
			setFadeClass('mask-fade-both');
		} else if (hasRight) {
			setFadeClass('mask-fade-right');
		} else if (hasLeft) {
			setFadeClass('mask-fade-left');
		} else {
			setFadeClass('');
		}
	}, [listRef]);

	useEffect(() => {
		const el = listRef.current;
		if (!el) return;

		updateMask();
		const handleScroll = () => {
			updateMask();
			const activeEl = el.querySelector<HTMLElement>('[aria-selected="true"]');
			if (activeEl) updateMarker(activeEl, false);
		};

		el.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', updateMask);

		return () => {
			el.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', updateMask);
		};
	}, [listRef, updateMask, updateMarker]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
		const el = listRef.current;
		if (!el) return;

		const triggers = Array.from(
			el.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
		);
		if (triggers.length === 0) return;

		const currentIndex = triggers.findIndex((t) => t.getAttribute('aria-selected') === 'true');
		let nextIndex = 0;

		if (e.key === 'Home') nextIndex = 0;
		else if (e.key === 'End') nextIndex = triggers.length - 1;
		else if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % triggers.length;
		else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;

		e.preventDefault();
		const nextTrigger = triggers[nextIndex];
		if (nextTrigger) {
			const nextValue = nextTrigger.getAttribute('data-value');
			if (nextValue) {
				setActiveTab(nextValue, true);
				nextTrigger.focus();
			}
		}
	};

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label={ariaLabel}
			onKeyDown={handleKeyDown}
			className={cn(
				'relative flex gap-7 overflow-x-auto scrollbar-none border-b border-line',
				fadeClass,
				className
			)}
		>
			<span
				ref={markerRef}
				aria-hidden="true"
				className="absolute bottom-0 left-0 h-0.5 w-px bg-brand origin-left pointer-events-none"
			/>
			{children}
		</div>
	);
}

export interface EditorialTabTriggerProps {
	value: string;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
}

export function EditorialTabTrigger({
	value,
	disabled = false,
	className,
	children,
}: EditorialTabTriggerProps) {
	const { activeTab, setActiveTab, baseId, registerTrigger } = useEditorialTabs();
	const isSelected = activeTab === value;
	const tabId = `${baseId}-tab-${value}`;
	const panelId = `${baseId}-panel-${value}`;

	const refCallback = useCallback(
		(el: HTMLButtonElement | null) => {
			registerTrigger(value, el);
		},
		[registerTrigger, value]
	);

	return (
		<button
			ref={refCallback}
			role="tab"
			type="button"
			id={tabId}
			data-value={value}
			aria-selected={isSelected}
			aria-controls={panelId}
			tabIndex={isSelected ? 0 : -1}
			disabled={disabled}
			onClick={() => setActiveTab(value, true)}
			className={cn(
				'pressable relative shrink-0 border-0 bg-transparent py-2.5 pb-3.5 text-caption font-medium tracking-label uppercase tabular-nums cursor-pointer transition-[color,transform,scale] duration-150',
				isSelected ? 'text-text' : 'text-dim can-hover:hover:text-text',
				disabled && 'opacity-40 cursor-not-allowed',
				className
			)}
		>
			{children}
		</button>
	);
}

export interface EditorialTabContentProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

export function EditorialTabContent({
	value,
	className,
	children,
}: EditorialTabContentProps) {
	const { activeTab, baseId } = useEditorialTabs();
	const isSelected = activeTab === value;
	const tabId = `${baseId}-tab-${value}`;
	const panelId = `${baseId}-panel-${value}`;

	if (!isSelected) return null;

	return (
		<div
			role="tabpanel"
			id={panelId}
			aria-labelledby={tabId}
			tabIndex={0}
			className={cn('outline-none pt-4', className)}
		>
			{children}
		</div>
	);
}
