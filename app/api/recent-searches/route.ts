import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/lib/db/recent-searches';
import {
	recentSearchAddBodySchema,
	recentSearchesQuerySchema,
	firstValidationError,
} from '@/lib/validation/api-schemas';
import { badRequest, tooManyRequests } from '@/lib/api/route-responses';
import { rateLimitRetryAfter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// A non-numeric limit used to become NaN and surface as a 500.
		const parsed = recentSearchesQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams)
		);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const searches = await getRecentSearches(session.user.id, parsed.data.limit);
		return NextResponse.json(searches);
	} catch (error) {
		console.error('Error fetching recent searches:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`recent-searches:post:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return badRequest('Invalid JSON body');
		}

		const parsed = recentSearchAddBodySchema.safeParse(body);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const item = await addRecentSearch(session.user.id, parsed.data.query.trim());
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding recent search:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`recent-searches:delete:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		await clearRecentSearches(session.user.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error clearing recent searches:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
