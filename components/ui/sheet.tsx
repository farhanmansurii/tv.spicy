'use client';

import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:duration-160 data-[state=closed]:duration-120 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				className
			)}
			{...props}
		/>
	);
}

const sheetVariants = cva(
	'fixed z-50 gap-4 bg-background shadow-2xl transition ease-sheet data-[state=closed]:duration-120 data-[state=open]:duration-160 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
	{
		variants: {
			side: {
				top: 'inset-x-0 top-0 origin-top border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
				bottom: 'inset-x-0 bottom-0 origin-bottom rounded-t-3xl border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
				left: 'inset-y-0 left-0 h-full w-sheet-width max-w-100 origin-left border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
				right: 'inset-y-0 right-0 h-full w-sheet-width max-w-100 origin-right border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
			},
		},
		defaultVariants: {
			side: 'right',
		},
	}
);

function SheetContent({
	side = 'right',
	appearance = 'default',
	className,
	children,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants> & { appearance?: 'default' | 'sidebar' }) {
	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot="sheet-content"
				className={cn(sheetVariants({ side }), appearance === 'sidebar' && 'border-l border-border/30 bg-background/95 p-0 text-sidebar-foreground backdrop-blur-2xl saturate-glass', className)}
				{...props}
			>
				<SheetPrimitive.Close className="hit-target absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-foreground/[0.05] text-foreground/60 transition-colors duration-200 can-hover:bg-foreground/[0.1] can-hover:text-foreground disabled:pointer-events-none">
					<X className="size-4" strokeWidth={2} />
					<span className="sr-only">Close</span>
				</SheetPrimitive.Close>
				{children}
			</SheetPrimitive.Content>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="sheet-header"
			className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn('text-lg font-semibold text-foreground', className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
