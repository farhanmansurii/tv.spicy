import { NextRequest, NextResponse } from 'next/server';
import { fetchBasicDetailsTMDB } from '@/lib/api/tmdb-client';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const id = request.nextUrl.searchParams.get('id') ?? '';
	const type = request.nextUrl.searchParams.get('type');

	if (!/^[1-9]\d*$/.test(id) || (type !== 'movie' && type !== 'tv')) {
		return NextResponse.json({ error: 'Invalid detail parameters' }, { status: 400 });
	}

	const details = await fetchBasicDetailsTMDB(id, type);
	return details
		? NextResponse.json(details, { headers: cachedResponseHeaders() })
		: NextResponse.json({ error: 'Media not found' }, { status: 404 });
}
