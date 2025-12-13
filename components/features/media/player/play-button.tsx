'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function PlayButton(props: any) {
	return (
		<Button onClick={() => props.setshow(true)} size="lg" className="w-full md:w-fit px-5">
			Play Movie
		</Button>
	);
}
