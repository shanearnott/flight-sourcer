import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/flights.db';
const dbDir = path.dirname(path.resolve(dbPath));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: DatabaseType = new Database(path.resolve(dbPath));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      origin_label TEXT NOT NULL,
      destination_label TEXT NOT NULL,
      origin_airports TEXT NOT NULL,
      destination_airports TEXT NOT NULL,
      trip_type TEXT NOT NULL CHECK(trip_type IN ('weekend','week','custom')),
      window_start TEXT NOT NULL,
      window_end TEXT NOT NULL,
      min_nights INTEGER NOT NULL DEFAULT 2,
      max_nights INTEGER NOT NULL DEFAULT 7,
      cabin_class TEXT NOT NULL DEFAULT 'ECONOMY',
      adults INTEGER NOT NULL DEFAULT 1,
      airline_codes TEXT,
      search_mode TEXT NOT NULL DEFAULT 'both' CHECK(search_mode IN ('cash','award','both')),
      alert_email TEXT,
      alert_threshold_cash REAL,
      alert_threshold_points INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      last_checked TEXT
    );

    CREATE TABLE IF NOT EXISTS price_snapshots (
      id TEXT PRIMARY KEY,
      search_id TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      snapshot_type TEXT NOT NULL CHECK(snapshot_type IN ('cash','award')),
      results TEXT NOT NULL,
      min_price REAL,
      max_price REAL,
      FOREIGN KEY (search_id) REFERENCES searches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts_log (
      id TEXT PRIMARY KEY,
      search_id TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      alert_type TEXT NOT NULL CHECK(alert_type IN ('cash','award')),
      price REAL,
      details TEXT,
      FOREIGN KEY (search_id) REFERENCES searches(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_search_id ON price_snapshots(search_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_checked_at ON price_snapshots(checked_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_search_id ON alerts_log(search_id);

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function getSetting(key: string): string | null {
  const row = db.prepare(`SELECT value FROM app_settings WHERE key = ?`).get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(`INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
}

export function deleteSetting(key: string): void {
  db.prepare(`DELETE FROM app_settings WHERE key = ?`).run(key);
}
