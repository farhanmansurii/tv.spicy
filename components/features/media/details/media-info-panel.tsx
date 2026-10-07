'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
	EditorialTabs,
	EditorialTabList,
	EditorialTabTrigger,
	EditorialTabContent,
} from '@/components/ui/editorial-tabs';
import { MediaFallback } from '@/components/ui/media-fallback';
import { tmdbImage } from '@/lib/tmdb-image';

interface CastMember {
	id: number;
	name: string;
	character?: string;
	profile_path?: string | null;
}

interface CrewMember {
	id?: number;
	name: string;
	job?: string;
	department?: string;
	profile_path?: string | null;
}

interface Video {
	key: string;
	name: string;
	id: string;
	type: string;
	site: string;
}

interface MediaInfoPanelProps {
	data: any;
	type: 'movie' | 'tv';
	credits?: { cast?: CastMember[]; crew?: CrewMember[] } | null;
	videos?: Video[];
}

function formatDate(dateStr?: string | null) {
	if (!dateStr) return null;
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatRuntime(minutes?: number | null) {
	if (!minutes || minutes <= 0) return null;
	return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

const CAST_PORTRAITS = 8;

function getInitials(name?: string) {
	if (!name) return '';
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return (parts[0]?.[0] || '').toUpperCase();
}

function CastPortrait({ person }: { person: CastMember }) {
	const [imageError, setImageError] = useState(false);
	const hasImage = Boolean(person.profile_path) && !imageError;

	return (
		<li className="w-28 shrink-0 snap-start md:w-auto">
			<div className="relative mb-3 aspect-4/5 w-full overflow-hidden rounded-sm bg-gradient-card-placeholder shadow-inset-line">
				{hasImage ? (
					<img
						src={tmdbImage(person.profile_path!, 'w185')}
						alt=""
						loading="lazy"
						decoding="async"
						onError={() => setImageError(true)}
						className="size-full object-cover object-top"
					/>
				) : (
					<MediaFallback variant="portrait" initials={getInitials(person.name)} />
				)}
			</div>
			<p className="line-clamp-2 text-small font-semibold leading-snug text-text">{person.name}</p>
			{person.character && (
				<p className="mt-1 line-clamp-2 font-mono text-micro uppercase leading-snug tracking-meta text-dim">
					{person.character}
				</p>
			)}
		</li>
	);
}

function MediaInfoPanelComponent({ data, type, credits }: MediaInfoPanelProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const headRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const cast = useMemo(() => credits?.cast ?? [], [credits?.cast]);

	const crew = useMemo(() => {
		const rawCrew = credits?.crew ?? [];
		if (type === 'tv' && data?.created_by?.length) {
			const creators = data.created_by.map((c: any) => ({
				id: c.id,
				name: c.name,
				job: 'Creator',
			}));
			const otherCrew = rawCrew
				.filter(
					(c) =>
						c.job === 'Executive Producer' ||
						c.job === 'Director' ||
						c.job === 'Writer'
				)
				.slice(0, 6);
			return [...creators, ...otherCrew];
		}

		const directors = rawCrew.filter((c) => c.job === 'Director');
		const writers = rawCrew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer');
		const producers = rawCrew
			.filter((c) => c.job === 'Producer' || c.job === 'Executive Producer')
			.slice(0, 4);

		const combined = [...directors, ...writers, ...producers];
		return combined.length > 0 ? combined : rawCrew.slice(0, 8);
	}, [credits?.crew, data?.created_by, type]);

	const facts = useMemo(() => {
		const list: Array<[string, string | null]> = [];

		if (data?.status) {
			list.push(['Status', data.status]);
		}

		const releaseDate =
			type === 'tv' ? formatDate(data?.first_air_date) : formatDate(data?.release_date);
		if (releaseDate) {
			list.push([type === 'tv' ? 'First aired' : 'Released', releaseDate]);
		}

		if (type === 'tv') {
			const count =
				data?.number_of_seasons ??
				(data?.seasons ? data.seasons.filter((s: any) => s.season_number > 0).length : null);
			if (count) {
				list.push(['Seasons', `${count} ${count === 1 ? 'Season' : 'Seasons'}`]);
			}
		} else if (data?.runtime) {
			const rt = formatRuntime(data.runtime);
			if (rt) list.push(['Runtime', rt]);
		}

		if (data?.genres?.length) {
			const topGenres = data.genres
				.slice(0, 3)
				.map((g: any) => g.name)
				.join(' / ');
			const extra = data.genres.length > 3 ? ` +${data.genres.length - 3}` : '';
			list.push(['Genres', `${topGenres}${extra}`]);
		}

		const language =
			data?.spoken_languages?.[0]?.english_name ||
			(data?.original_language ? data.original_language.toUpperCase() : null);
		if (language) {
			list.push(['Language', language]);
		}

		const networksOrStudios =
			type === 'tv' ? data?.networks : data?.production_companies;
		if (networksOrStudios?.length) {
			const topItems = networksOrStudios
				.slice(0, 3)
				.map((item: any) => item.name)
				.join(' / ');
			const extra =
				networksOrStudios.length > 3 ? ` +${networksOrStudios.length - 3}` : '';
			list.push([type === 'tv' ? 'Network' : 'Studio', `${topItems}${extra}`]);
		}

		return list.filter(([, value]) => Boolean(value)) as Array<[string, string]>;
	}, [data, type]);

	const hasCast = cast.length > 0;
	const hasCrew = crew.length > 0;
	const defaultTab = hasCast ? 'cast' : hasCrew ? 'crew' : 'details';

	useEffect(() => {
		if (!sectionRef.current) return;
		sectionRef.current.classList.add('dv-section');
		headRef.current?.classList.add('dv-head');
		panelRef.current?.classList.add('dv-panel');
	}, []);

	const sectionIndex = type === 'tv' ? '02' : '01';

	return (
		<section
			ref={sectionRef}
			id="about"
			aria-labelledby="about-title"
			className="mb-section scroll-mt-8 px-gutter"
		>
			{/* Section Heading */}
			<div
				ref={headRef}
				className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7"
			>
				<span
					className="pb-1 font-mono text-caption uppercase text-brand tracking-label tabular-nums"
					aria-hidden="true"
				>
					{sectionIndex}
				</span>
				<h2
					id="about-title"
					className="text-title text-balance text-text"
				>
					About
				</h2>
				<span className="ml-auto pb-1 text-right font-mono text-caption uppercase text-dim tracking-label tabular-nums">
					The people / the picture
				</span>
			</div>

			{/* Editorial Tabs */}
			<div ref={panelRef}>
				<EditorialTabs defaultValue={defaultTab} ariaLabel="About this title">
					<EditorialTabList className="mb-7">
						{hasCast && <EditorialTabTrigger value="cast">Cast</EditorialTabTrigger>}
						{hasCrew && <EditorialTabTrigger value="crew">Crew</EditorialTabTrigger>}
						<EditorialTabTrigger value="details">Details</EditorialTabTrigger>
					</EditorialTabList>

					{/* Cast Tab Content */}
					{hasCast && (
						<EditorialTabContent value="cast">
							<ul className="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter) scrollbar-none md:mx-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-8 md:overflow-visible md:px-0 lg:grid-cols-8">
								{cast.slice(0, CAST_PORTRAITS).map((person) => (
									<CastPortrait key={person.id} person={person} />
								))}
							</ul>
							{cast.length > CAST_PORTRAITS && (
								<p className="mt-8 max-w-prose text-small leading-relaxed text-dim">
									<span className="mr-3 font-mono text-micro uppercase tracking-label text-muted-foreground">
										Also starring
									</span>
									{cast
										.slice(CAST_PORTRAITS)
										.map((p) => p.name)
										.join(', ')}
								</p>
							)}
						</EditorialTabContent>
					)}

					{/* Crew Tab Content */}
					{hasCrew && (
						<EditorialTabContent value="crew">
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6">
								{crew.map((member, idx) => (
									<div
										key={`${member.name}-${idx}`}
										className="pb-4 border-b border-line"
									>
										<span className="block mb-2 font-mono text-caption text-dim uppercase tracking-label truncate">
											{member.job || 'Crew'}
										</span>
										<span className="line-clamp-2 text-ui font-medium text-text">
											{member.name}
										</span>
									</div>
								))}
							</div>
						</EditorialTabContent>
					)}

					{/* Details Tab Content */}
					<EditorialTabContent value="details">
						<dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
							{facts.map(([label, value]) => (
								<div key={label} className="py-3.5 border-b border-line">
									<dt className="font-mono text-caption uppercase text-dim tracking-label">
										{label}
									</dt>
									<dd className="mt-2.5 font-sans text-body text-text tabular-nums">
										{value}
									</dd>
								</div>
							))}
						</dl>
					</EditorialTabContent>
				</EditorialTabs>
			</div>
		</section>
	);
}

export default memo(MediaInfoPanelComponent);
MediaInfoPanelComponent.displayName = 'MediaInfoPanel';
