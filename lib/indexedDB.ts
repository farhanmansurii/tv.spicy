interface Episode {
  tv_id: string;
  name: string;
}

const DB_NAME = "TVShowDB";
const STORE_NAME = "recentlyWatchedEpisodes";
const SEARCH_STORE_NAME = "recentlySearchedEpisodes";

function openDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "tv_id" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };
  });
}

export async function saveEpisodesToDB(episodes: Episode[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  for (const episode of episodes) {
    store.put(episode);
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(new Error("Failed to save episodes to IndexedDB"));
    };
  });
}

export async function loadEpisodesFromDB(): Promise<Episode[]> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
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
      db.close();
      reject(new Error("Failed to load episodes from IndexedDB"));
    };
  });
}

export async function deleteAllEpisodesFromDB(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
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
      reject(new Error("Failed to delete episodes from IndexedDB"));
    };
  });
}
export async function saveRecentlySearchedToDB(recentlySearchedItems: any[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(SEARCH_STORE_NAME, "readwrite");
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
      reject(new Error("Failed to save recently searched items to IndexedDB"));
    };
  });
}

export async function loadRecentlySearchedFromDB(): Promise<any[]> {
  const db = await openDB();
  const transaction = db.transaction(SEARCH_STORE_NAME, "readonly");
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
      reject(new Error("Failed to load recently searched items from IndexedDB"));
    };
  });
}

export async function deleteAllRecentlySearchedFromDB(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(SEARCH_STORE_NAME, "readwrite");
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
      reject(new Error("Failed to delete recently searched items from IndexedDB"));
    };
  });
}


