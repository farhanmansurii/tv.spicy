'use client';

import React, { useCallback, useEffect, useId, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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

/** Focus ring token from DESIGN.md — keep in sync with the design system. */
const FOCUS_RING =
	'focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none';

/** Scale-only press feedback: transform transition, never `transition: all`. */
const PRESSABLE =
	'transition-transform duration-[160ms] ease-out active:scale-[0.97] motion-reduce:active:scale-100';

/**
 * Centered confirmation modal for destructive actions.
 *
 * Motion contract: enters over 240ms ease-out, exits faster at 160ms ease-out
 * (never ease-in), all motion under 300ms. Under prefers-reduced-motion the
 * modal fades with opacity only — no scale or translation.
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
	const cancelRef = useRef<HTMLButtonElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);
	// Keyboard-activated confirm/cancel skips the exit animation entirely.
	// State (not a ref) so it can be read during render when building `exit`.
	const [keyboardInitiated, setKeyboardInitiated] = useState(false);
	const reduceMotion = useReducedMotion();
	const titleId = useId();
	const descriptionId = useId();

	const handleButtonActivate = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
			setKeyboardInitiated(event.detail === 0);
			action();
		},
		[]
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
				setKeyboardInitiated(true);
				onCancel();
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
		[onCancel]
	);

	if (typeof document === 'undefined') return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-[90] flex items-center justify-center p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						duration: reduceMotion ? 0 : 0.2,
						ease: [0, 0, 0.2, 1], // ease-out, never ease-in
					}}
					onKeyDown={handleKeyDown}
				>
					{/* Backdrop */}
					<motion.button
						type="button"
						aria-label={cancelLabel}
						tabIndex={-1}
						onClick={onCancel}
						className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: reduceMotion ? 0 : 0.16,
							ease: [0, 0, 0.2, 1],
						}}
					/>

					{/* Dialog */}
					<motion.div
						ref={dialogRef}
						role="alertdialog"
						aria-modal="true"
						aria-labelledby={titleId}
						aria-describedby={description ? descriptionId : undefined}
						className="relative w-full max-w-[min(92vw,26rem)] rounded-2xl border border-white/10 bg-[#1C1C1E] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
						initial={
							reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }
						}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={
							reduceMotion
								? { opacity: 0, transition: { duration: 0, ease: [0, 0, 0.2, 1] } }
								: {
										opacity: 0,
										scale: 0.98,
										y: 4,
										// Exit is faster than enter (160ms < 240ms) and is
										// skipped entirely for keyboard-initiated actions.
										transition: {
											duration: keyboardInitiated ? 0 : 0.16,
											ease: [0, 0, 0.2, 1],
										},
									}
						}
						transition={{
							duration: reduceMotion ? 0 : 0.24,
							ease: [0, 0, 0.2, 1], // enter: ease-out, 240ms
						}}
					>
						<h2 id={titleId} className="text-base font-semibold text-white">
							{title}
						</h2>
						{description && (
							<p
								id={descriptionId}
								className="mt-2 text-sm leading-relaxed text-white/60"
							>
								{description}
							</p>
						)}

						<div className="mt-5 flex items-center justify-end gap-2.5">
							<button
								ref={cancelRef}
								type="button"
								onClick={(event) => handleButtonActivate(event, onCancel)}
								className={`rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1] ${PRESSABLE} ${FOCUS_RING}`}
							>
								{cancelLabel}
							</button>
							<button
								type="button"
								onClick={(event) => handleButtonActivate(event, onConfirm)}
								className={`rounded-full bg-[#FF453A] px-4 py-2 text-sm font-semibold text-black hover:bg-[#ff5c52] ${PRESSABLE} ${FOCUS_RING}`}
							>
								{confirmLabel}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
}

export const DestructiveConfirm = memo(DestructiveConfirmComponent);
DestructiveConfirm.displayName = 'DestructiveConfirm';
