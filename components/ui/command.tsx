'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// --- Base Command Wrapper ---
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-card md:rounded-card-md bg-transparent text-white',
        className
      )}
      {...props}
    />
  );
}

// --- Command Modal (The Pop-up) ---
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          // Liquid Glass Base Styles
          'overflow-hidden p-0 shadow-2xl bg-black/60 backdrop-blur-3xl border border-white/10 sm:rounded-dialog md:sm:rounded-dialog-md',
          className
        )}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/50 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// --- Input Field ---
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    // Wrapper creates the border and spacing
    <div
      data-slot="command-input-wrapper"
      className="flex h-14 items-center border-b border-white/5 bg-white/[0.02] px-4"
    >
      {/* Icon is shrink-0 to prevent crushing/overlap */}
      <Search className="mr-2 size-5 shrink-0 opacity-50 text-white" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'flex h-full w-full rounded-ui bg-transparent py-3 text-base outline-none placeholder:text-white/30 text-white disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  );
}

// --- List Container ---
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        // Hide scrollbar but allow scroll
        'max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-none',
        className
      )}
      {...props}
    />
  );
}

// --- Empty State ---
function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm text-white/40"
      {...props}
    />
  );
}

// --- Group Header ---
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden p-1 text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-white/30 [&_[cmdk-group-heading]]:uppercase',
        className
      )}
      {...props}
    />
  );
}

// --- Separator Line ---
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-white/5', className)}
      {...props}
    />
  );
}

// --- Individual Item (The Interactive Part) ---
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Default text color
        "text-white/70",
        // Active/Selected State - This creates the 'Glass Highlight'
        "aria-selected:bg-white/10 aria-selected:text-white aria-selected:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

// --- Keyboard Shortcut (e.g. ⌘K) ---
function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('ml-auto text-xs tracking-widest text-white/30', className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
