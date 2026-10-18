import type { SQLiteDatabase } from 'expo-sqlite';
import type { Trip, VehicleAssumption } from './types';

export const defaultVehicle: VehicleAssumption = { mpg: 25, pricePerGallon: null, label: 'Illustrative gasoline car' };

export async function initialize(db: SQLiteDatabase) {
  await db.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY NOT NULL, created_at INTEGER NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);`);
}

export async function saveTrip(db: SQLiteDatabase, trip: Trip) {
  await db.runAsync('INSERT OR REPLACE INTO trips (id, created_at, payload) VALUES (?, ?, ?)', trip.id, trip.createdAt, JSON.stringify(trip));
}

export async function getTrip(db: SQLiteDatabase, id: string): Promise<Trip | null> {
  const row = await db.getFirstAsync<{ payload: string }>('SELECT payload FROM trips WHERE id = ?', id);
  return row ? JSON.parse(row.payload) as Trip : null;
}

export async function getTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync<{ payload: string }>('SELECT payload FROM trips ORDER BY created_at DESC');
  return rows.map((row) => JSON.parse(row.payload) as Trip);
}

export async function getVehicle(db: SQLiteDatabase): Promise<VehicleAssumption> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'vehicle');
  return row ? JSON.parse(row.value) as VehicleAssumption : defaultVehicle;
}

export async function saveVehicle(db: SQLiteDatabase, vehicle: VehicleAssumption) {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'vehicle', JSON.stringify(vehicle));
}
