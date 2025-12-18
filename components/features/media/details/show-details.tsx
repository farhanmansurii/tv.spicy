'use client';

import { HeroBanner } from '@/components/features/media/hero-banner';

interface ShowDetailsProps {
	id: number | string;
	show: any;
	type: string;
}

export default function ShowDetails({ id, show, type }: ShowDetailsProps) {
	return <HeroBanner id={id} show={show} type={type} isDetailsPage={true} />;
}
