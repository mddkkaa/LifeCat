const Database = require('better-sqlite3');
const path = require('path');

// Если есть Volume (Railway) — пишем туда. Иначе — рядом с файлом.
const DB_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'lifecat.db')
    : path.join(__dirname, 'lifecat.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT    NOT NULL,
        created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cats (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL UNIQUE,
        name          TEXT    NOT NULL,
        gender        TEXT    NOT NULL,
        tribe         TEXT    NOT NULL,
        color_fur     TEXT,
        color_eye     TEXT,
        avatar        TEXT,
        rank          TEXT    NOT NULL DEFAULT 'kit',
        activity      INTEGER NOT NULL DEFAULT 0,
        hp            INTEGER NOT NULL DEFAULT 100,
        hunger        INTEGER NOT NULL DEFAULT 100,
        exp           INTEGER NOT NULL DEFAULT 0,
        created_at    INTEGER NOT NULL,
        deletion_requested_at INTEGER,
        deletion_available_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

console.log('🗄️  База данных готова:', DB_PATH);

module.exports = db;