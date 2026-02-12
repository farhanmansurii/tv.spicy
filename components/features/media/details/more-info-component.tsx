import { Show } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import React from 'react';
import EstimateFinishTime from '@/components/features/media/player/estimate-finish-time';
import { Separator } from '@/components/ui/separator';

const MoreInfoComponent: React.FC<{ show: Show; type: string }> = ({ show, type }) => {
	return (
		<div className="w-full pb-2.5 grid grid-cols-2 gap-5">
			{show?.overview && (
				<>
					<div className="font-bold">Overview:</div>
					<div className="font-normal">{show?.overview}</div>
					<Separator /> <Separator />
				</>
			)}
			{show?.vote_average && (
				<>
					<div className="font-bold">Rating:</div>
					<div className="font-normal">{show?.vote_average.toFixed(2)}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{(show?.release_date || show?.first_air_date) && (
				<>
					<div className="font-bold">Release Date:</div>
					<div className="font-normal">{show?.release_date || show?.first_air_date}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{show?.spoken_languages && (
				<>
					<div className="font-bold">Language:</div>
					<div className="font-normal">{show?.spoken_languages?.[0]?.english_name}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{show?.origin_country?.length! > 0 && (
				<>
					<div className="font-bold">Origin:</div>
					<div className="font-normal uppercase">{show?.origin_country?.join(', ')}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{type === 'tv' && show?.status && (
				<>
					<div className="font-bold">Status:</div>
					<div className="font-normal">{show?.status}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{type === 'tv' && show?.last_air_date && (
				<>
					<div className="font-bold">Last Air Date:</div>
					<div className="font-normal">{show?.last_air_date}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{type === 'tv' && show?.number_of_seasons && show?.number_of_episodes && (
				<>
					<div className="font-bold">Seasons / episodes:</div>
					<div className="font-normal">
						{show?.number_of_seasons} seasons {show?.number_of_episodes} episodes
					</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{type === 'movie' && show?.runtime && (
				<>
					<div className="font-bold">Runtime:</div>
					<div className="font-normal">{show?.runtime} minutes</div>
					<div className="col-span-2">
						<EstimateFinishTime runtime={show?.runtime} />
					</div>
					<Separator /> <Separator />{' '}
				</>
			)}
			{type === 'movie' && show?.budget && (
				<>
					<div className="font-bold">Budget:</div>
					<div className="font-normal">${show?.budget}</div>
					<Separator /> <Separator />
				</>
			)}
			{type === 'movie' && show?.revenue && (
				<>
					<div className="font-bold">Revenue:</div>
					<div className="font-normal">${show?.revenue}</div>
					<Separator /> <Separator />{' '}
				</>
			)}
		</div>
	);
};

export default MoreInfoComponent;
