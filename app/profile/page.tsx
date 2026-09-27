import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import ProfilePageClient from '@/components/features/profile/profile-page-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Profile | Spicy TV',
	description: 'Manage your Spicy TV profile, watchlist, and preferences.',
};

// TODO: Cache Components adoption. Per-user route (session); stays dynamic.
export const instant = false;

export default async function ProfilePage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin?callbackUrl=/profile');
	}

	return <ProfilePageClient session={session} />;
}
