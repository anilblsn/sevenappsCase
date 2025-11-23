import { VideoEntry } from '@/types/video';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;
let isInitialized = false;

const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('videoDiary.db');
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const database = await getDatabase();
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          originalUri TEXT NOT NULL,
          croppedUri TEXT NOT NULL,
          startTime REAL NOT NULL,
          endTime REAL NOT NULL,
          duration REAL NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
      isInitialized = true;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
};

const ensureInitialized = async (): Promise<void> => {
  if (!isInitialized) {
    await initDatabase();
  }
};

export const insertVideo = async (video: VideoEntry): Promise<void> => {
  try {
    await ensureInitialized();
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO videos (id, name, description, originalUri, croppedUri, startTime, endTime, duration, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        video.id,
        video.name,
        video.description,
        video.originalUri,
        video.croppedUri,
        video.startTime,
        video.endTime,
        video.duration,
        video.createdAt,
        video.updatedAt,
      ]
    );
  } catch (error) {
    console.error('Error inserting video:', error);
    throw error;
  }
};

export const getAllVideos = async (): Promise<VideoEntry[]> => {
  try {
    await ensureInitialized();
    const database = await getDatabase();
    const result = await database.getAllAsync<VideoEntry>(
      'SELECT * FROM videos ORDER BY createdAt DESC;',
      []
    );
    return result;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

export const updateVideo = async (
  id: string,
  updates: Partial<VideoEntry>
): Promise<void> => {
  try {
    await ensureInitialized();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.updatedAt !== undefined) {
      fields.push('updatedAt = ?');
      values.push(updates.updatedAt);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    const database = await getDatabase();
    await database.runAsync(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

export const deleteVideo = async (id: string): Promise<void> => {
  try {
    await ensureInitialized();
    const database = await getDatabase();
    await database.runAsync('DELETE FROM videos WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

export const getVideoById = async (id: string): Promise<VideoEntry | null> => {
  try {
    await ensureInitialized();
    const database = await getDatabase();
    const result = await database.getFirstAsync<VideoEntry>(
      'SELECT * FROM videos WHERE id = ?;',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};
