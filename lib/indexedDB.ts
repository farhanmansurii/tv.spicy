import { openDB, IDBPDatabase, IDBPTransaction } from 'idb';

interface TVShowDB {
  recentlyWatched: any[];
  recentlySearched: any[];
}

const DB_NAME = 'tvShowDB'; // Change the database name
const DB_VERSION = 1;

const initDB = async (): Promise<IDBPDatabase<TVShowDB>> => {
  return openDB<TVShowDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('recentlyWatched')) {
        db.createObjectStore('recentlyWatched', { keyPath: 'tv_id' }); // Change the key path
      }
      if (!db.objectStoreNames.contains('recentlySearched')) {
        db.createObjectStore('recentlySearched', { keyPath: 'id' });
      }
    },
  });
};

export const addRecentlyWatched = async (tvShow: any) => { // Change the parameter name
  const db = await initDB();
  const tx = db.transaction('recentlyWatched', 'readwrite');
  const store = tx.objectStore('recentlyWatched');
  await store.put(tvShow);
};

export const getRecentlyWatched = async (): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction('recentlyWatched', 'readonly');
  const store = tx.objectStore('recentlyWatched');
  const recentlyWatched = await store.getAll();
  return recentlyWatched;
};

export const addRecentlySearched = async (tvShow: any) => { // Change the parameter name
  const db = await initDB();
  const tx = db.transaction('recentlySearched', 'readwrite');
  const store = tx.objectStore('recentlySearched');
  await store.add(tvShow);
};

export const getRecentlySearched = async (): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction('recentlySearched', 'readonly');
  const store = tx.objectStore('recentlySearched');
  const recentlySearched = await store.getAll();
  return recentlySearched;
};
