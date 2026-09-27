import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export const EASE_ENTRANCE = [0.23, 1, 0.32, 1] as const;

export const CURVES = {
	enter: 'power4.out',
	exit: 'power2.in',
	move: 'power3.inOut',
	touch: 'ease-out',
	time: 'none',
} as const;

export const TIMINGS = {
	enter: 0.45,
	exit: 0.18,
	move: 0.55,
	touch: 0.15,
	fade: 0.28,
	image: 0.25,
} as const;

export const STAGGER = {
	word: 0.055,
	card: 0.045,
	exitWord: 0.03,
	maxStaggeredCards: 8,
} as const;

export const DISTANCE = {
	rise: 16,
	lift: 8,
	mask: 110,
} as const;

const REDUCED_DURATION = 0.18;
const REDUCED_EXIT = 0.15;
const REDUCED_STAGGER = 0.02;

export function isReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let pluginsRegistered = false;

/** Subscribes to the reduced-motion preference so recipes can branch on it live. */
export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);
	return reduced;
}

export function registerGSAP(): typeof gsap | null {
	if (typeof window === 'undefined') return null;
	if (!pluginsRegistered) {
		gsap.registerPlugin(ScrollTrigger, SplitText);
		pluginsRegistered = true;
	}
	return gsap;
}

export function staggerAt(index: number, step: number, cap = STAGGER.maxStaggeredCards): number {
	return Math.min(index, cap) * step;
}

export function cardRiseDelay(index: number): number {
	return 0.18 + staggerAt(index, STAGGER.card);
}

export interface RecipeOptions {
	reduced?: boolean;
	delay?: number;
	distance?: number;
}

/** Arriving: opacity plus a short rise, entrance ease, 450ms. */
export function enter(options: RecipeOptions = {}): gsap.TweenVars {
	if (options.reduced) {
		return {
			opacity: 0,
			duration: REDUCED_DURATION,
			delay: options.delay ?? 0,
			ease: CURVES.enter,
		};
	}
	return {
		opacity: 0,
		y: options.distance ?? DISTANCE.rise,
		duration: TIMINGS.enter,
		delay: options.delay ?? 0,
		ease: CURVES.enter,
	};
}

/** Leaving: always faster and shorter than enter, and it travels less. */
export function exit(options: RecipeOptions = {}): gsap.TweenVars {
	if (options.reduced) {
		return { opacity: 0, duration: REDUCED_EXIT, delay: options.delay ?? 0, ease: CURVES.exit };
	}
	return {
		opacity: 0,
		y: -(options.distance ?? DISTANCE.lift),
		duration: TIMINGS.exit,
		delay: options.delay ?? 0,
		ease: CURVES.exit,
	};
}

/** Travelling on screen: poster morph, marker glide, row scroll. */
export function move(options: RecipeOptions = {}): gsap.TweenVars {
	if (options.reduced) {
		return {
			opacity: 0,
			duration: REDUCED_DURATION,
			delay: options.delay ?? 0,
			ease: CURVES.enter,
		};
	}
	return { duration: TIMINGS.move, delay: options.delay ?? 0, ease: CURVES.move };
}

/** Two states of the same thing: one fade, optionally bridged with a 2px blur. */
export function crossfade(options: { duration?: number; blur?: boolean } = {}): gsap.TweenVars {
	return {
		duration: options.duration ?? TIMINGS.fade,
		ease: CURVES.enter,
		...(options.blur === true ? { filter: 'blur(0px)' } : {}),
	};
}

export interface RevealOptions {
	reduced?: boolean;
	delay?: number;
	distance?: number;
	step?: number;
}

function hasTargets(targets: gsap.TweenTarget): boolean {
	if (!targets) return false;
	if (typeof targets === 'string') return true;
	if (Array.isArray(targets)) return targets.length > 0;
	return (targets as NodeList).length > 0;
}

/** A block arriving: opacity plus a rise, staggered, once. */
export function reveal(
	targets: gsap.TweenTarget,
	options: RevealOptions = {}
): gsap.core.Timeline | null {
	if (typeof window === 'undefined' || !hasTargets(targets)) return null;
	const reduced = options.reduced ?? isReducedMotion();
	return gsap.timeline().from(targets, {
		...enter({ reduced, delay: options.delay, distance: options.distance }),
		stagger: reduced
			? REDUCED_STAGGER
			: (index: number) => staggerAt(index, options.step ?? STAGGER.card),
		clearProps: 'transform,opacity',
	});
}

/** A row or grid of items arriving in sequence, capped at the eighth item. */
export function cardCascade(
	targets: gsap.TweenTarget,
	options: RevealOptions = {}
): gsap.core.Timeline | null {
	return reveal(targets, {
		...options,
		distance: options.distance ?? DISTANCE.rise,
		step: STAGGER.card,
	});
}

const ROW_REVEAL = { start: 'top 92%', rise: 12, duration: 0.6, ease: 'power3.out' } as const;

/**
 * A section whose heading and cards arrive once as it scrolls in. Sections already on screen at
 * mount are left alone, and off-screen ones are hidden before they can be seen, so painted content
 * never snaps to hidden and back. Returns a cleanup that always leaves everything visible.
 */
export function revealOnScroll(
	section: HTMLElement,
	heading: ArrayLike<HTMLElement>,
	cards: ArrayLike<HTMLElement>
): () => void {
	const g = registerGSAP();
	const headingEls = Array.from(heading);
	const cardEls = Array.from(cards);
	const all = [...headingEls, ...cardEls];
	const isOnScreen = section.getBoundingClientRect().top < window.innerHeight;
	if (!g || all.length === 0 || isOnScreen || isReducedMotion()) return () => {};

	g.set(all, { opacity: 0, y: ROW_REVEAL.rise });
	const timeline = g.timeline({ paused: true });
	if (headingEls.length > 0) {
		timeline.to(headingEls, { opacity: 1, y: 0, duration: ROW_REVEAL.duration, ease: ROW_REVEAL.ease }, 0);
	}
	if (cardEls.length > 0) {
		timeline.to(
			cardEls,
			{
				opacity: 1,
				y: 0,
				duration: ROW_REVEAL.duration,
				ease: ROW_REVEAL.ease,
				stagger: (index: number) => staggerAt(index, STAGGER.card),
			},
			0.06
		);
	}
	timeline.eventCallback('onComplete', () => g.set(all, { clearProps: 'opacity,transform' }));

	const trigger = ScrollTrigger.create({
		trigger: section,
		start: ROW_REVEAL.start,
		once: true,
		onEnter: () => timeline.play(),
	});

	return () => {
		trigger.kill();
		timeline.kill();
		g.set(all, { clearProps: 'opacity,transform' });
	};
}

/** Skeleton to content, one commit: a 2px blur and a fade over 280ms. */
export function skeletonResolve(
	target: gsap.TweenTarget,
	options: { reduced?: boolean } = {}
): gsap.core.Tween | null {
	if (typeof window === 'undefined' || !hasTargets(target)) return null;
	const reduced = options.reduced ?? isReducedMotion();
	return gsap.fromTo(target, reduced ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)' }, {
		opacity: 1,
		...(reduced ? {} : { filter: 'blur(0px)' }),
		duration: TIMINGS.fade,
		ease: CURVES.enter,
		clearProps: 'opacity,filter',
	});
}

export interface ArrivalOptions {
	afterMorph?: boolean;
	onComplete?: () => void;
}

const ARRIVAL_CLEAR = 'transform,opacity,filter,scale';
const ARRIVAL_TARGETS =
	'.dv-art img, .dv-title, .dv-overline, .dv-quote, .dv-rating, .dv-synopsis, .dv-actions';

const titleSplits = new WeakMap<HTMLElement, InstanceType<typeof SplitText>>();

/**
 * A from() tween leaves its start state on the element when it is killed, and
 * the next from() then records that leftover 0 as its end value, so a second
 * arrival animates 0 to 0 and the copy stays invisible forever. Every arrival
 * tween is therefore a fromTo with explicit end values that restores the
 * natural state on interrupt.
 */
function restoreOnInterrupt(targets: gsap.TweenTarget) {
	return () => {
		const elements = gsap.utils.toArray(targets);
		if (elements.length > 0) gsap.set(elements, { clearProps: ARRIVAL_CLEAR });
	};
}

function splitTitleOnce(target: HTMLElement) {
	titleSplits.get(target)?.revert();
	const split = SplitText.create(target, {
		type: 'lines,words',
		mask: 'words',
		autoSplit: true,
	});
	titleSplits.set(target, split);
	return split;
}

function unsplitTitle(target: HTMLElement | null) {
	if (!target) return;
	titleSplits.get(target)?.revert();
	titleSplits.delete(target);
}

/** Detail page opening like a feature spread (MOTION.md A). */
const ROUTE_LEAVE = { duration: 0.15, restoreAfterMs: 1500 } as const;
const ROUTE_ENTER = { duration: 0.25 } as const;
let routeRestoreTimer: ReturnType<typeof setTimeout> | undefined;
let isLeavingRoute = false;

/** Fades the page out while the next route's first response is on its way. */
export function leaveRoute(main: HTMLElement): void {
	const g = registerGSAP();
	if (!g || isReducedMotion()) return;
	isLeavingRoute = true;
	g.killTweensOf(main);
	g.to(main, { opacity: 0, duration: ROUTE_LEAVE.duration, ease: 'power2.out' });
	clearTimeout(routeRestoreTimer);
	// A click that never navigates (cancelled, same URL, failed) must not leave the page hidden.
	routeRestoreTimer = setTimeout(() => enterRoute(main), ROUTE_LEAVE.restoreAfterMs);
}

/** Brings the page back once the new route has committed; a no-op unless a leave ran. */
export function enterRoute(main: HTMLElement): void {
	const g = registerGSAP();
	clearTimeout(routeRestoreTimer);
	if (!g || !isLeavingRoute) return;
	isLeavingRoute = false;
	g.killTweensOf(main);
	g.to(main, { opacity: 1, duration: ROUTE_ENTER.duration, ease: 'power2.out', clearProps: 'opacity' });
}

let hasLeftLandingPage = false;

/**
 * True while still on the URL this document was loaded with: the server HTML is already on
 * screen there, so hiding it to replay an entrance would read as a blink.
 */
function isLandingPaint(): boolean {
	const landing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	const isLandingUrl = !!landing && new URL(landing.name).pathname === window.location.pathname;
	if (!isLandingUrl) hasLeftLandingPage = true;
	return isLandingUrl && !hasLeftLandingPage;
}

export function arrival(
	root: HTMLElement,
	options: ArrivalOptions = {}
): gsap.core.Timeline | null {
	if (typeof window === 'undefined') return null;
	registerGSAP();
	if (isLandingPaint()) {
		options.onComplete?.();
		return null;
	}

	const reduced = isReducedMotion();
	if (reduced) {
		const targets = root.querySelectorAll(ARRIVAL_TARGETS);
		if (targets.length > 0) {
			gsap.fromTo(
				targets,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: REDUCED_DURATION,
					stagger: REDUCED_STAGGER,
					clearProps: 'opacity',
					onInterrupt: restoreOnInterrupt(targets),
					onComplete: options.onComplete,
				}
			);
		} else {
			options.onComplete?.();
		}
		return null;
	}

	const tl = gsap.timeline({
		onComplete: () => {
			unsplitTitle(root.querySelector<HTMLElement>('.dv-title-main'));
			options.onComplete?.();
		},
	});

	const cover = root.querySelector<HTMLElement>('.dv-art img');
	if (cover && !options.afterMorph) {
		tl.fromTo(
			cover,
			{ scale: 1.04, opacity: 0.5 },
			{
				scale: 1,
				opacity: 1,
				duration: 0.7,
				ease: CURVES.enter,
				clearProps: ARRIVAL_CLEAR,
				onInterrupt: restoreOnInterrupt(cover),
			},
			0
		);
	}

	const titleElement = root.querySelector<HTMLElement>('.dv-title-main');
	const isNonLatin = root.querySelector('.dv-title.is-nonlatin') !== null;

	if (titleElement) {
		if (isNonLatin) {
			tl.fromTo(
				titleElement,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: TIMINGS.enter,
					ease: CURVES.enter,
					clearProps: 'opacity',
					onInterrupt: restoreOnInterrupt(titleElement),
				},
				0.1
			);
		} else {
			try {
				const split = splitTitleOnce(titleElement);
				tl.fromTo(
					split.words,
					{ yPercent: DISTANCE.mask },
					{
						yPercent: 0,
						duration: TIMINGS.enter,
						stagger: STAGGER.word,
						ease: CURVES.enter,
						clearProps: 'transform',
						onInterrupt: restoreOnInterrupt(split.words),
					},
					0.1
				);
			} catch {
				tl.fromTo(
					titleElement,
					{ opacity: 0, y: DISTANCE.rise },
					{
						opacity: 1,
						y: 0,
						duration: TIMINGS.enter,
						ease: CURVES.enter,
						clearProps: 'transform,opacity',
						onInterrupt: restoreOnInterrupt(titleElement),
					},
					0.1
				);
			}
		}
	}

	const metaTargets = root.querySelectorAll('.dv-overline, .dv-rating, .dv-quote');
	if (metaTargets.length > 0) {
		tl.fromTo(
			metaTargets,
			{ opacity: 0, y: 12 },
			{
				opacity: 1,
				y: 0,
				duration: TIMINGS.enter,
				stagger: STAGGER.card,
				ease: CURVES.enter,
				clearProps: 'transform,opacity',
				onInterrupt: restoreOnInterrupt(metaTargets),
			},
			0.25
		);
	}

	const actionTargets = root.querySelectorAll('.dv-synopsis, .dv-actions');
	if (actionTargets.length > 0) {
		tl.fromTo(
			actionTargets,
			{ opacity: 0, y: 12 },
			{
				opacity: 1,
				y: 0,
				duration: TIMINGS.enter,
				stagger: STAGGER.card,
				ease: CURVES.enter,
				clearProps: 'transform,opacity',
				onInterrupt: restoreOnInterrupt(actionTargets),
			},
			0.35
		);
	}

	return tl;
}

export const animateArrival = arrival;

/** Sections on scroll (MOTION.md B): once, no scrub, no pin, no replay. */
export function sectionReveal(
	targets: string | HTMLElement[] | NodeListOf<HTMLElement>
): (() => void) | undefined {
	if (typeof window === 'undefined') return undefined;
	const sections: HTMLElement[] =
		typeof targets === 'string'
			? Array.from(document.querySelectorAll<HTMLElement>(targets))
			: Array.from(targets);
	if (sections.length === 0) return undefined;

	const cleanups = sections.map((section) =>
		revealOnScroll(
			section,
			section.querySelectorAll<HTMLElement>('.dv-head'),
			section.querySelectorAll<HTMLElement>('.dv-episode, .dv-panel, .row-track > li')
		)
	);
	return () => cleanups.forEach((cleanup) => cleanup());
}

export const setupSectionReveals = sectionReveal;

export function flourishMyList(button: HTMLElement): void {
	if (typeof window === 'undefined') return;
	registerGSAP();

	if (isReducedMotion()) return;

	const plus = button.querySelector<SVGElement>('.i-plus, [data-icon="plus"]');
	const check = button.querySelector<SVGElement>('.i-check, [data-icon="check"]');

	if (plus) {
		gsap.fromTo(
			plus,
			{ filter: 'blur(0px)', opacity: 1 },
			{
				filter: 'blur(2px)',
				opacity: 0,
				duration: 0.2,
				ease: CURVES.exit,
				clearProps: 'filter,opacity',
			}
		);
	}

	if (check) {
		gsap.fromTo(
			check,
			{ filter: 'blur(2px)', opacity: 0 },
			{ filter: 'blur(0px)', opacity: 1, duration: 0.2, clearProps: 'filter,opacity' }
		);

		const path = check.querySelector('path');
		if (path) {
			const length = path.getTotalLength();
			gsap.fromTo(
				path,
				{ strokeDasharray: length, strokeDashoffset: length },
				{
					strokeDashoffset: 0,
					duration: 0.25,
					clearProps: 'strokeDasharray,strokeDashoffset',
				}
			);
		}
	}

	const ring = document.createElement('span');
	ring.style.position = 'absolute';
	ring.style.inset = '-3px';
	ring.style.borderRadius = '999px';
	ring.style.border = '2px solid var(--color-brand)';
	ring.style.pointerEvents = 'none';
	button.appendChild(ring);

	gsap.fromTo(
		ring,
		{ scale: 1, opacity: 1 },
		{
			scale: 1.15,
			opacity: 0,
			duration: 0.4,
			ease: CURVES.enter,
			onComplete: () => ring.remove(),
		}
	);
}

const REEL_COPY = '[data-reel-copy]';
const REEL_TITLES = ['[data-reel-title]', '[data-reel-sub]'];
const REEL_BLOCKS = '[data-reel-slate], [data-reel-score], [data-reel-actions]';
const REEL_GHOST = '[data-reel-ghost] span';

interface ReelWords {
	words: Element[];
	revert: () => void;
}

function splitTitles(copy: HTMLElement): ReelWords {
	const words: Element[] = [];
	const splits: InstanceType<typeof SplitText>[] = [];
	REEL_TITLES.forEach((selector) => {
		const target = copy.querySelector<HTMLElement>(selector);
		if (!target?.textContent?.trim()) return;
		try {
			const split = SplitText.create(target, {
				type: 'words',
				mask: 'words',
				autoSplit: true,
			});
			splits.push(split);
			words.push(...split.words);
		} catch {
			// A title GSAP cannot split still animates as one block.
		}
	});
	return { words, revert: () => splits.forEach((split) => split.revert()) };
}

export interface ReelSelectOptions {
	immediate?: boolean;
	from: number;
}

/** Keeps a staggered exit inside one exit window instead of stretching it. */
function exitStagger(
	count: number,
	from: 'start' | 'end'
): Pick<gsap.TweenVars, 'duration' | 'stagger'> {
	const each = STAGGER.exitWord;
	return {
		duration: Math.max(0.08, TIMINGS.exit - Math.max(0, count - 1) * each),
		stagger: { each, from },
	};
}

export interface ReelController {
	/** Leave the copy of `from` and hand the swap to React at `index`. */
	select(index: number, options: ReelSelectOptions): void;
	/** Play the arriving copy once React has committed the swapped slide. */
	enter(): void;
	destroy(): void;
}

/**
 * Home hero reel change (MOTION.md C): the old words lift out, the backdrop
 * cross-dissolves with a 1.03 settle underneath, then the new words rise from
 * their masks. A new selection kills the running timeline and starts again
 * from the values on screen, so rapid clicks land on the target, never queue.
 */
export function reelChange(
	root: HTMLElement,
	handlers: { onSwap: (index: number) => void }
): ReelController {
	registerGSAP();

	const copy = root.querySelector<HTMLElement>(REEL_COPY);
	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	let reduced = query.matches;
	let timeline: gsap.core.Timeline | null = null;
	let words: ReelWords | null = null;
	let target = -1;
	let instant = false;

	function onQueryChange() {
		reduced = query.matches;
	}
	query.addEventListener('change', onQueryChange);

	function backdropFor(index: number) {
		return index < 0
			? null
			: root.querySelector<HTMLElement>(`[data-reel-backdrop="${index}"]`);
	}

	function reset() {
		timeline?.kill();
		timeline = null;
		words?.revert();
		words = null;
		if (copy) {
			gsap.set(copy, { clearProps: 'transform,opacity' });
			gsap.set(copy.querySelectorAll<HTMLElement>(REEL_BLOCKS), {
				clearProps: 'transform,opacity',
			});
			gsap.set(copy.querySelectorAll<HTMLElement>(REEL_TITLES.join(',')), {
				clearProps: 'transform,opacity',
			});
		}
		gsap.set(root.querySelectorAll<HTMLElement>(REEL_GHOST), {
			clearProps: 'transform,opacity',
		});
	}

	function playOut(index: number, from: number) {
		if (!copy) {
			handlers.onSwap(index);
			return;
		}

		const incoming = backdropFor(index);
		const outgoing = backdropFor(from);
		if (incoming && outgoing && !reduced) {
			gsap.fromTo(
				incoming,
				{ opacity: 0, scale: 1.03 },
				{
					opacity: 1,
					scale: 1,
					duration: TIMINGS.enter,
					ease: CURVES.enter,
					overwrite: 'auto',
					clearProps: 'transform,opacity',
				}
			);
		}

		const tl = gsap.timeline({
			onComplete: () => {
				words?.revert();
				words = null;
				handlers.onSwap(index);
			},
		});
		timeline = tl;

		if (reduced) {
			tl.to(copy, { opacity: 0, duration: REDUCED_EXIT, ease: CURVES.exit }, 0);
			return;
		}

		words = splitTitles(copy);
		if (words.words.length > 0) {
			tl.to(words.words, { ...exit(), ...exitStagger(words.words.length, 'end') }, 0);
		} else {
			tl.to(copy.querySelectorAll<HTMLElement>(REEL_TITLES.join(',')), exit(), 0);
		}

		const blocks = copy.querySelectorAll<HTMLElement>(REEL_BLOCKS);
		if (blocks.length > 0) {
			tl.to(blocks, { ...exit(), ...exitStagger(blocks.length, 'start') }, 0);
		}
	}

	function playEnter(index: number) {
		if (!copy) return;
		const tl = gsap.timeline({
			onComplete: () => {
				words?.revert();
				words = null;
			},
		});
		timeline = tl;

		if (reduced) {
			tl.fromTo(
				copy,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: REDUCED_DURATION,
					ease: CURVES.enter,
					clearProps: 'opacity',
				},
				0
			);
			return;
		}

		words = splitTitles(copy);
		if (words.words.length > 0) {
			tl.from(
				words.words,
				{
					yPercent: DISTANCE.mask,
					duration: TIMINGS.enter,
					ease: CURVES.enter,
					stagger: (i: number) => staggerAt(i, STAGGER.word),
					clearProps: 'transform',
				},
				0.02
			);
		} else {
			tl.from(
				copy.querySelectorAll<HTMLElement>(REEL_TITLES.join(',')),
				enter({ delay: 0.02 }),
				0.02
			);
		}

		const slate = copy.querySelector<HTMLElement>('[data-reel-slate]');
		const score = copy.querySelector<HTMLElement>('[data-reel-score]');
		const actions = copy.querySelector<HTMLElement>('[data-reel-actions]');
		if (slate) tl.from(slate, enter({ distance: DISTANCE.lift }), 0);
		if (score) tl.from(score, enter({ delay: 0.06, distance: DISTANCE.lift }), 0.06);
		if (actions) tl.from(actions, enter({ delay: 0.1, distance: DISTANCE.lift }), 0.1);

		const ghostOut = root.querySelector<HTMLElement>('[data-reel-ghost="out"]');
		const ghostIn = root.querySelector<HTMLElement>('[data-reel-ghost="in"]');
		if (ghostOut && ghostIn) {
			tl.to(ghostOut, { ...exit(), clearProps: 'transform,opacity' }, 0);
			tl.fromTo(
				ghostIn,
				{ y: DISTANCE.lift, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: TIMINGS.enter,
					ease: CURVES.enter,
					clearProps: 'transform,opacity',
				},
				0.06
			);
		}
	}

	return {
		select(index, options) {
			reset();
			target = index;
			if (options.immediate) {
				instant = true;
				handlers.onSwap(index);
				return;
			}
			playOut(index, options.from);
		},
		enter() {
			const index = target;
			target = -1;
			const wasInstant = instant;
			instant = false;
			reset();
			if (wasInstant || index < 0) return;
			playEnter(index);
		},
		destroy() {
			query.removeEventListener('change', onQueryChange);
			reset();
		},
	};
}

const OPENING_SESSION_KEY = 'spicy:home-opening-played';

/**
 * Opening title card: once per visit, a settle of copy that is already on
 * screen, dropped straight to its resting state the moment anyone interacts.
 */
export function openingTitleCard(root: HTMLElement): { interrupt: () => void } {
	registerGSAP();
	let timeline: gsap.core.Timeline | null = null;
	let words: ReelWords | null = null;
	let played = true;

	try {
		played = sessionStorage.getItem(OPENING_SESSION_KEY) === '1';
		if (!played) sessionStorage.setItem(OPENING_SESSION_KEY, '1');
	} catch {
		return { interrupt: () => undefined };
	}
	if (played || isReducedMotion() || isLandingPaint()) return { interrupt: () => undefined };

	const copy = root.querySelector<HTMLElement>(REEL_COPY);
	const rail = root.querySelector<HTMLElement>('[data-reel-rail]');
	if (!copy) return { interrupt: () => undefined };
	const copyEl = copy;

	const interactions = ['scroll', 'keydown', 'pointerdown', 'touchstart'] as const;
	let settled = false;
	function settle() {
		if (settled) return;
		settled = true;
		interactions.forEach((event) => window.removeEventListener(event, snap, true));
		timeline?.progress(1);
		timeline?.kill();
		timeline = null;
		words?.revert();
		words = null;
		gsap.set(copyEl.querySelectorAll<HTMLElement>(REEL_BLOCKS), {
			clearProps: 'transform,opacity',
		});
		gsap.set(copyEl.querySelectorAll<HTMLElement>(REEL_TITLES.join(',')), {
			clearProps: 'transform,opacity',
		});
		if (rail) gsap.set(rail, { clearProps: 'transform,opacity' });
	}
	function snap() {
		settle();
	}

	words = splitTitles(copyEl);
	timeline = gsap.timeline({ onComplete: settle });
	timeline.from(
		words.words.length > 0
			? words.words
			: copyEl.querySelectorAll<HTMLElement>(REEL_TITLES.join(',')),
		{
			y: 12,
			duration: TIMINGS.enter,
			ease: CURVES.enter,
			stagger: (i: number) => staggerAt(i, STAGGER.word),
		},
		0.08
	);
	timeline.from(
		copyEl.querySelectorAll<HTMLElement>(REEL_BLOCKS),
		{ y: DISTANCE.lift, duration: 0.3, ease: CURVES.enter },
		0
	);
	if (rail) timeline.from(rail, { y: DISTANCE.lift, duration: 0.3, ease: CURVES.enter }, 0.1);
	interactions.forEach((event) =>
		window.addEventListener(event, snap, { once: true, passive: true, capture: true })
	);

	return { interrupt: settle };
}
