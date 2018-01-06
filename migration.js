const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS Employee`);
  db.run(`DROP TABLE IF EXISTS Timesheet`);
  db.run(`DROP TABLE IF EXISTS Menu`);
  db.run(`DROP TABLE IF EXISTS MenuItem`);
  db.run(`CREATE TABLE Employee(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1);`);
    db.run(`CREATE TABLE Series (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL);`);
    db.run(`CREATE TABLE Issue (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    issue_number TEXT NOT NULL,
    publication_date TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    FOREIGN KEY(artist_id) REFERENCES Artist(id),
    FOREIGN KEY (series_id) REFERENCES Series(id));`);
});
