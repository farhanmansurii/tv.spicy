'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Container from '@/components/shared/containers/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { Calendar, Clock, Film, Tv, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const { watchlist, tvwatchlist } = useWatchListStore();
	const { recentlyWatched } = useTVShowStore();

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin?callbackUrl=/profile');
		}
	}, [status, router]);

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	const userInitials = session.user?.name
		?.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'U';

	const totalWatchlist = (watchlist?.length || 0) + (tvwatchlist?.length || 0);
	const totalWatched = recentlyWatched?.length || 0;

	return (
		<div className="min-h-screen mt-20">
			<Container className="py-8 md:py-12">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Profile Header */}
					<Card className="bg-black/40 backdrop-blur-xl border-white/10 p-8">
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
							<Avatar className="h-24 w-24 border-2 border-white/20">
								<AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
								<AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 text-center md:text-left">
								<h1 className="text-3xl font-bold text-white mb-2">{session.user?.name || 'User'}</h1>
								<p className="text-white/60 mb-4">{session.user?.email}</p>
							<div className="flex items-center gap-2 justify-center md:justify-start">
								<span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
									Account
								</span>
							</div>
							</div>
						</div>
					</Card>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-lg bg-primary/20">
									<Film className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">{totalWatchlist}</p>
									<p className="text-sm text-white/60">In Watchlist</p>
								</div>
							</div>
						</Card>

						<Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-lg bg-primary/20">
									<Clock className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">{totalWatched}</p>
									<p className="text-sm text-white/60">Recently Watched</p>
								</div>
							</div>
						</Card>

						<Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-lg bg-primary/20">
									<Star className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{watchlist?.length || 0}
									</p>
									<p className="text-sm text-white/60">Movies Saved</p>
								</div>
							</div>
						</Card>
					</div>

					{/* Quick Actions */}
					<Card className="bg-black/40 backdrop-blur-xl border-white/10 p-6">
						<h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Button
								variant="outline"
								className="justify-start h-auto py-4 border-white/10 hover:bg-white/10"
								onClick={() => router.push('/')}
							>
								<Film className="w-5 h-5 mr-2" />
								<div className="text-left">
									<p className="font-semibold">Home</p>
									<p className="text-xs text-white/60">View watchlist and favorites</p>
								</div>
							</Button>
							<Button
								variant="outline"
								className="justify-start h-auto py-4 border-white/10 hover:bg-white/10"
								onClick={() => router.push('/#continue-watching')}
							>
								<Clock className="w-5 h-5 mr-2" />
								<div className="text-left">
									<p className="font-semibold">Continue Watching</p>
									<p className="text-xs text-white/60">Resume your shows</p>
								</div>
							</Button>
						</div>
					</Card>
				</div>
			</Container>
		</div>
	);
}
