CREATE TABLE IF NOT EXISTS reservations (
  gift_id INTEGER PRIMARY KEY,
  token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reservations_token ON reservations (token);
