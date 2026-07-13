import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { fetchUserHomeData } from '@/lib/db/home-data';

export async function GET() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	return NextResponse.json(await fetchUserHomeData(session.user.id), {
		headers: { 'Cache-Control': 'private, no-store' },
	});
}
