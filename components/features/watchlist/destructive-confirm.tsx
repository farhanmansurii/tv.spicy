'use client';

import React, { useCallback, useEffect, useId, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { CURVES, exit, isReducedMotion, registerGSAP } from '@/lib/motion';

/** MOTION.md "Everything else": dialogs scale from .95 and fade over 200ms. */
const DIALOG = { enter: 0.2, backdrop: 0.16, scaleFrom: 0.95, rise: 8 } as const;
const REDUCED = 0.18;

interface DestructiveConfirmProps {
	/** Whether the centered confirm modal is visible. */
	open: boolean;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Runs when the user commits the destructive action. */
	onConfirm: () => void;
	/** Runs on cancel, backdrop click, or Escape. */
	onCancel: () => void;
}

const FOCUS_RING =
	'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none';

/** Scale-only press feedback: transform transition, never `transition: all`. */
const PRESSABLE =
	'transition-transform duration-(--duration-press) ease-out active:scale-97 motion-reduce:active:scale-100';

/**
 * Centered confirmation modal for destructive actions.
 *
 * Motion: the dialog enters on the shared `enter` recipe and leaves on the
 * shared `exit` recipe, so the exit is always faster than the enter and travels
 * less. Under prefers-reduced-motion both are opacity-only.
 */
function DestructiveConfirmComponent({
	open,
	title,
	description,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
}: DestructiveConfirmProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLButtonElement>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);
	// Keyboard-activated confirm/cancel skips the exit animation entirely.
	const [keyboardInitiated, setKeyboardInitiated] = useState(false);
	// `open` drives the request; `mounted` keeps the node alive through the exit.
	const [mounted, setMounted] = useState(open);
	const titleId = useId();
	const descriptionId = useId();

	const handleButtonActivate = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
			setKeyboardInitiated(event.detail === 0);
			action();
		},
		[]
	);

	const close = useCallback(
		(event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent) => {
			if (event && 'detail' in event && event.detail === 0) setKeyboardInitiated(true);
			onCancel();
		},
		[onCancel]
	);

	// Safe default: focus Cancel while the modal is open, restore focus after.
	useEffect(() => {
		if (!open) return;
		setKeyboardInitiated(false);
		previouslyFocused.current = document.activeElement as HTMLElement | null;
		cancelRef.current?.focus();
		return () => {
			previouslyFocused.current?.focus?.();
		};
	}, [open]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.stopPropagation();
				close(event);
				return;
			}
			if (event.key !== 'Tab') return;
			// Minimal focus trap: keep Tab cycling inside the dialog.
			const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (!focusable || focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;
			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		},
		[close]
	);

	// Hold the node mounted until the exit finishes, so the dialog never pops.
	useEffect(() => {
		if (open) {
			setMounted(true);
			return;
		}
		if (!mounted) return;
		// Keyboard actions swap the dialog instantly: no exit to wait for.
		if (keyboardInitiated) {
			setMounted(false);
			return;
		}

		const gsap = registerGSAP();
		if (!gsap) {
			setMounted(false);
			return;
		}

		const reduced = isReducedMotion();
		const timeline = gsap.timeline({ onComplete: () => setMounted(false) });
		timeline.to([backdropRef.current, dialogRef.current].filter(Boolean), {
			...exit({ reduced, distance: 4 }),
			scale: reduced ? 1 : 0.98,
			clearProps: 'transform,opacity',
		});
		return () => {
			timeline.kill();
		};
	}, [open, mounted, keyboardInitiated]);

	// Enter runs on the node that just mounted, once per open.
	const enterOnMount = useRef(false);
	useEffect(() => {
		if (!mounted) {
			enterOnMount.current = false;
			return;
		}
		if (!open || enterOnMount.current) return;

		const gsap = registerGSAP();
		if (!gsap) return;
		enterOnMount.current = true;

		const reduced = isReducedMotion();
		const timeline = gsap.timeline();
		timeline.fromTo(
			backdropRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: reduced ? REDUCED : DIALOG.backdrop, ease: CURVES.touch }
		);
		timeline.fromTo(
			dialogRef.current,
			reduced ? { opacity: 0 } : { opacity: 0, scale: DIALOG.scaleFrom, y: DIALOG.rise },
			{
				opacity: 1,
				scale: 1,
				y: 0,
				duration: reduced ? REDUCED : DIALOG.enter,
				ease: CURVES.enter,
				clearProps: 'transform,opacity',
			},
			0
		);
		return () => {
			timeline.kill();
		};
	}, [mounted, open]);

	if (typeof document === 'undefined' || !mounted) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-90 flex items-center justify-center p-4"
			onKeyDown={handleKeyDown}
		>
			{/* Backdrop */}
			<button
				ref={backdropRef}
				type="button"
				aria-label={cancelLabel}
				tabIndex={-1}
				onClick={() => close()}
				className="absolute inset-0 cursor-default bg-black/65"
			/>

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descriptionId : undefined}
				className="relative w-full max-w-dialog rounded-sm border border-line bg-surface p-5 shadow-overlay"
			>
				<h2 id={titleId} className="text-lede font-medium text-foreground">
					{title}
				</h2>
				{description && (
					<p id={descriptionId} className="mt-2 text-small text-dim">
						{description}
					</p>
				)}

				<div className="mt-5 flex items-center justify-end gap-2.5">
					<button
						ref={cancelRef}
						type="button"
						onClick={(event) => handleButtonActivate(event, onCancel)}
						className={`rounded-full border border-border-strong bg-card h-12 px-5 text-body font-semibold text-foreground can-hover:bg-raised ${PRESSABLE} ${FOCUS_RING}`}
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={(event) => handleButtonActivate(event, onConfirm)}
						className={`rounded-full bg-destructive h-12 px-5 text-body font-semibold text-foreground can-hover:bg-destructive/90 ${PRESSABLE} ${FOCUS_RING}`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}

export const DestructiveConfirm = memo(DestructiveConfirmComponent);
DestructiveConfirm.displayName = 'DestructiveConfirm';
