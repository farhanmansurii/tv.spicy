'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonalizedGreeting } from '@/hooks/use-personalized-greeting';
import { cn } from '@/lib/utils';

interface PersonalizedGreetingProps {
	className?: string;
}

function PersonalizedGreetingComponent({ className }: PersonalizedGreetingProps) {
	const { message, isAuthenticated } = usePersonalizedGreeting();

	if (!isAuthenticated || !message) {
		return null;
	}

	return (
		<div className={cn('relative w-full', className)}>
			<AnimatePresence mode="wait">
				<motion.h1
					key={message}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{
						duration: 0.5,
						ease: [0.4, 0, 0.2, 1],
					}}
					className={cn(
						'text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
						'font-black tracking-tighter',
						'text-white',
						'select-none',
						'leading-[1.1]'
					)}
					style={{ willChange: 'opacity, transform' }}
				>
					{message}
				</motion.h1>
			</AnimatePresence>
		</div>
	);
}

export const PersonalizedGreeting = memo(PersonalizedGreetingComponent);
PersonalizedGreeting.displayName = 'PersonalizedGreeting';
