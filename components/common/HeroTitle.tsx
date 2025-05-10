'use client';

import useTitle from '@/lib/use-title';

export default function HeroTitle() {
	const { title } = useTitle();

	return (
		<div className="text-left p-2">
			<h1 className="text-3xl  md:text-3xl  text-foreground">Hello {title}</h1>
		</div>
	);
}
