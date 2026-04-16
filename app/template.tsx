'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			{children}
		</motion.div>
	);
}
