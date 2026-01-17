export interface Episode {
	tv_id: string;
	name: string;
	id: number;
	episode_number: number;
	season_number: number;
	air_date: string;
	overview: string;
	runtime: number;
	still_path: string | null;
	time: number;
	show_name?: string; // Add this field
}

const DB_NAME = 'TVShowDB';
const STORE_NAME = 'recentlyWatchedEpisodes';
const SEARCH_STORE_NAME = 'recentlySearchedEpisodes';

function openDB(): Promise<IDBDatabase> {
	return new Promise<IDBDatabase>((resolve, reject) => {
		if (!window.indexedDB) {
			reject(new Error('IndexedDB is not supported in this browser'));
			return;
		}

		// Force a new database version to clear old data
		const request = indexedDB.open(DB_NAME, 3);

		request.onupgradeneeded = (event) => {
			const db = request.result;

			// Delete old stores if they exist
			if (db.objectStoreNames.contains(STORE_NAME)) {
				db.deleteObjectStore(STORE_NAME);
			}
			if (db.objectStoreNames.contains(SEARCH_STORE_NAME)) {
				db.deleteObjectStore(SEARCH_STORE_NAME);
			}

			// Create the recently watched episodes store
			const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			// Add indexes for better querying
			store.createIndex('tv_id', 'tv_id', { unique: false });
			store.createIndex('season_episode', ['tv_id', 'season_number', 'episode_number'], {
				unique: true,
			});

			// Create the recently searched store
			db.createObjectStore(SEARCH_STORE_NAME, { keyPath: 'id' });
		};

		request.onsuccess = () => {
			const db = request.result;
			resolve(db);
		};

		request.onerror = () => {
			console.error('Failed to open IndexedDB:', request.error);
			reject(new Error('Failed to open IndexedDB'));
		};
	});
}

export async function saveEpisodesToDB(episodes: Episode[]): Promise<void> {
	try {
		const db = await openDB();
		const transaction = db.transaction(STORE_NAME, 'readwrite');
		const store = transaction.objectStore(STORE_NAME);

		// Clear existing data first
		await new Promise<void>((resolve, reject) => {
			const clearRequest = store.clear();
			clearRequest.onsuccess = () => {
				resolve();
			};
			clearRequest.onerror = () => {
				console.error('Failed to clear store:', clearRequest.error);
				reject(new Error('Failed to clear store'));
			};
		});

		// Add new episodes
		for (const episode of episodes) {
			const addRequest = store.add(episode);
			addRequest.onerror = () => {
				console.error('Failed to add episode:', episode, 'Error:', addRequest.error);
			};
		}

		return new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => {
				db.close();
				resolve();
			};

			transaction.onerror = () => {
				console.error('Transaction failed:', transaction.error);
				db.close();
				reject(new Error('Failed to save episodes to IndexedDB'));
			};
		});
	} catch (error) {
		console.error('Error in saveEpisodesToDB:', error);
		throw error;
	}
}

export async function loadEpisodesFromDB(): Promise<Episode[]> {
	try {
		const db = await openDB();
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const store = transaction.objectStore(STORE_NAME);

		const episodes: Episode[] = [];

		return new Promise<Episode[]>((resolve, reject) => {
			const request = store.openCursor();

			request.onsuccess = (event) => {
				const cursor = request.result;
				if (cursor) {
					episodes.push(cursor.value);
					cursor.continue();
				} else {
					resolve(episodes);
				}
			};

			transaction.oncomplete = () => {
				db.close();
			};

			transaction.onerror = () => {
				console.error('Failed to load episodes:', transaction.error);
				db.close();
				reject(new Error('Failed to load episodes from IndexedDB'));
			};
		});
	} catch (error) {
		console.error('Error in loadEpisodesFromDB:', error);
		throw error;
	}
}

export async function deleteAllEpisodesFromDB(): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, 'readwrite');
	const store = transaction.objectStore(STORE_NAME);

	return new Promise<void>((resolve, reject) => {
		const request = store.openCursor();

		request.onsuccess = (event) => {
			const cursor = request.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			} else {
				db.close();
				resolve();
			}
		};

		request.onerror = () => {
			db.close();
			reject(new Error('Failed to delete episodes from IndexedDB'));
		};
	});
}
export async function saveRecentlySearchedToDB(recentlySearchedItems: any[]): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction(SEARCH_STORE_NAME, 'readwrite');
	const store = transaction.objectStore(SEARCH_STORE_NAME);

	for (const item of recentlySearchedItems) {
		store.add(item);
	}

	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => {
			db.close();
			resolve();
		};

		transaction.onerror = () => {
			db.close();
			reject(new Error('Failed to save recently searched items to IndexedDB'));
		};
	});
}

export async function loadRecentlySearchedFromDB(): Promise<any[]> {
	const db = await openDB();
	const transaction = db.transaction(SEARCH_STORE_NAME, 'readonly');
	const store = transaction.objectStore(SEARCH_STORE_NAME);

	const recentlySearchedItems: any[] = [];

	return new Promise<any[]>((resolve, reject) => {
		const request = store.openCursor();

		request.onsuccess = (event) => {
			const cursor = request.result;
			if (cursor) {
				recentlySearchedItems.push(cursor.value);
				cursor.continue();
			} else {
				resolve(recentlySearchedItems);
			}
		};

		transaction.oncomplete = () => {
			db.close();
		};

		transaction.onerror = () => {
			db.close();
			reject(new Error('Failed to load recently searched items from IndexedDB'));
		};
	});
}

export async function deleteAllRecentlySearchedFromDB(): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction(SEARCH_STORE_NAME, 'readwrite');
	const store = transaction.objectStore(SEARCH_STORE_NAME);

	return new Promise<void>((resolve, reject) => {
		const request = store.openCursor();

		request.onsuccess = (event) => {
			const cursor = request.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			} else {
				db.close();
				resolve();
			}
		};

		request.onerror = () => {
			db.close();
			reject(new Error('Failed to delete recently searched items from IndexedDB'));
		};
	});
}
