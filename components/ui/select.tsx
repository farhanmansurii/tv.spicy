'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
	className,
	surface = 'default',
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	surface?: 'default' | 'glass' | 'field';
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-sm disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
				surface === 'glass' &&
					'rounded-full border-0 bg-foreground/[0.06] text-soft shadow-glass',
				surface === 'field' &&
					'h-12 w-auto gap-3 rounded-full border-line-strong bg-foreground/8 pr-3 pl-4 text-ui text-foreground shadow-none transition-[background-color,border-color,transform] duration-(--duration-ui) active:scale-97 can-hover:border-foreground/40 can-hover:bg-foreground/14 data-[state=open]:border-foreground/40 motion-reduce:active:scale-100',
				className
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	surface = 'default',
	children,
	position = 'popper',
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & { surface?: 'default' | 'glass' }) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					'relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					surface === 'glass' && 'max-h-75 rounded-sm border border-line bg-popover p-1.5 text-soft shadow-select-glass',
					className
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						'p-1',
						position === 'popper' &&
							'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)'
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn('px-2 py-1.5 text-sm font-semibold', className)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	surface = 'default',
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { surface?: 'default' | 'glass' }) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-foreground/[0.08] focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				surface === 'glass' && 'focus:bg-foreground/[0.12] focus:text-foreground can-hover:bg-foreground/[0.06] can-hover:text-foreground/90',
				className
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<Check className="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn('flex cursor-default items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronUp className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn('flex cursor-default items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronDown className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
