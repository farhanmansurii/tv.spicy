'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { syncLocalToDatabase } from '@/lib/sync/local-to-db';
import { toast } from 'sonner';

export function useSync() {
	const { data: session } = useSession();
	const [isSyncing, setIsSyncing] = useState(false);
	const [lastSync, setLastSync] = useState<Date | null>(null);

	const sync = useCallback(async () => {
		if (!session?.user?.id) {
			toast.error('Please sign in to sync your data');
			return;
		}

		setIsSyncing(true);
		try {
			const result = await syncLocalToDatabase(session.user.id);
			if (result.success) {
				setLastSync(new Date());
				toast.success('Data synced successfully', {
					description: 'Your watchlist and history have been saved to the cloud',
				});
			} else {
				toast.error('Failed to sync data', {
					description: 'Please try again later',
				});
			}
		} catch (error) {
			console.error('Sync error:', error);
			toast.error('Sync failed', {
				description: 'An error occurred while syncing your data',
			});
		} finally {
			setIsSyncing(false);
		}
	}, [session]);

	return { sync, isSyncing, lastSync };
}
