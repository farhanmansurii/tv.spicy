/* eslint-disable react/display-name */
import { Button } from '@/components/ui/button';
import { Show } from '@/lib/types';
import {
	ArrowRight,
	BookmarkIcon,
	LucidePlay,
	LucidePlayCircle,
	PlayCircleIcon,
	PlaySquareIcon,
	Plus,
} from 'lucide-react';
import ContinueWatchingButton from './ContinueWatchingButton';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
/* eslint-disable @next/next/no-img-element */

interface CarousalCardProps {
	isDetailsPage?: boolean;
	show: Show;
	type?: string;
	id?: string;
}

const CarousalCard = ({ children }: { children: React.ReactNode }) => {
	return <div>{children}</div>;
};

CarousalCard.Image = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
	return <img alt={alt} className={className} src={src} />;
};

CarousalCard.Title = ({ title, className }: { title: string; className?: string }) => {
	return (
		<div
			style={{
				fontSize: '1.875rem', // equivalent to text-3xl
				display: '-webkit-box',
				WebkitBoxOrient: 'vertical',
				WebkitLineClamp: 3,
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				width: '75%', // equivalent to w-9/12
				textAlign: 'center',
				alignItems: 'center',
				justifyContent: 'center',
				fontWeight: 'bold',
			}}
			className={className}
		>
			{title}
		</div>
	);
};

CarousalCard.Genres = ({ genres }: { genres: string }) => {
	return <div className="opacity-50">{genres}</div>;
};

CarousalCard.Badge = ({ genres }: { genres: any[] }) => {
	return (
		<>
			{genres?.map((genre) => (
				<Badge key={genre.id} variant="outline" className="whitespace-nowrap">
					{genre.name}
				</Badge>
			))}
		</>
	);
};

CarousalCard.ContinueWatchingButton = ({
	isDetailsPage,
	show,
	type,
	id,
}: {
	isDetailsPage: boolean;
	show: Show;
	type: string;
	id: string;
}) => {
	return <ContinueWatchingButton isDetailsPage={isDetailsPage} show={show} type={type} id={id} />;
};

CarousalCard.Details = ({ overview }: { overview: string }) => {
	return <div className="text-xs opacity-50 normal-case line-clamp-3">{overview}</div>;
};

const CarousalCardWrapper = (props: CarousalCardProps) => {
	const { show, isDetailsPage, type } = props;

	if (!show) return null;

	return (
		<>
			<div className="flex  md:hidden h-[70vh] relative">
				<CarousalCard.Image
					alt=""
					className="inset-0  object-cover rounded-t-xl h-full w-full"
					src={`https://image.tmdb.org/t/p/original/${props.show.poster_path}`}
				/>
				<div className="border-white absolute flex justify-between bg-gradient-to-t from-background to-transparent bottom-0 top-1/2 w-full flex-col">
					<div></div>
					<div className="flex items-center flex-col">
						<CarousalCard.Title title={props.show.title || props.show.name} />
						<CarousalCard.Genres
							genres={props.show.genres?.name?.join(',') || 'Comedy'}
						/>
						<CarousalCard.Badge genres={props.show.genres} />
						<div className="flex flex-col w-60 my-2 gap-2">
							<CarousalCard.ContinueWatchingButton
								isDetailsPage={isDetailsPage || false}
								show={props.show}
								type={props.type ?? ''}
								id={props.show?.id as any}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="relative h-[70vh] md:flex hidden w-full mx-auto">
				<CarousalCard.Image
					alt=""
					className="h-full w-full rounded-t-2xl  mt-4 object-center object-cover"
					src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
				/>
				<div className="inset-0 bg-gradient-to-t from-background to-from-background/10 absolute justify-between flex flex-col">
					<div></div>
					<div className="w-[96%] mx-auto">
						<div className="flex gap-1 flex-col uppercase w-[500px] text-pretty">
							<div className="text-sm normal-case opacity-50">
								{format(new Date(show.first_air_date || show.release_date), 'PPP')}
							</div>
							<div className="text-3xl text-pretty font-bold">
								{show.title || show.name}
							</div>
							<CarousalCard.Details overview={show.overview} />
							<div className="flex my-2 gap-2">
								<CarousalCard.ContinueWatchingButton
									isDetailsPage={isDetailsPage || false}
									show={props.show}
									type={props.type ?? ''}
									id={props.show?.id as any}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

CarousalCardWrapper.Image = CarousalCard.Image;
CarousalCardWrapper.Title = CarousalCard.Title;
CarousalCardWrapper.Genres = CarousalCard.Genres;
CarousalCardWrapper.Badge = CarousalCard.Badge;
CarousalCardWrapper.ContinueWatchingButton = CarousalCard.ContinueWatchingButton;
CarousalCardWrapper.Details = CarousalCard.Details;

export default CarousalCardWrapper;
