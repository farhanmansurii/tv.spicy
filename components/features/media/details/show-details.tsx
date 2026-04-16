'use client';

import { HeroBanner } from '@/components/features/media/hero-banner';

interface ShowDetailsProps {
	show: any;
	type: 'movie' | 'tv';
}

export default function ShowDetails({ show, type }: ShowDetailsProps) {
	return <HeroBanner show={show} type={type} isDetailsPage={true} />;
}
