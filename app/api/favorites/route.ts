import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '@/lib/db/favorites';
import {
	favoriteAddBodySchema,
	listFilterQuerySchema,
	removeItemQuerySchema,
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

		const parsed = listFilterQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams)
		);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const favorites = await getFavorites(session.user.id, parsed.data.type);
		return NextResponse.json(favorites);
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`favorites:post:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return badRequest('Invalid JSON body');
		}

		const parsed = favoriteAddBodySchema.safeParse(body);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		// The schema's refine guarantees one of the two ids is present.
		const mediaId = parsed.data.mediaId ?? parsed.data.id;
		if (!mediaId) {
			return badRequest('mediaId is required');
		}
		const mediaType = parsed.data.mediaType ?? 'movie';

		const item = await addFavorite(session.user.id, mediaId, mediaType);
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding favorite:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`favorites:delete:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		const parsed = removeItemQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams)
		);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const { mediaId, mediaType } = parsed.data;

		if (mediaId && mediaType) {
			await removeFavorite(session.user.id, mediaId, mediaType);
		} else {
			await clearFavorites(session.user.id, mediaType);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing favorite:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
