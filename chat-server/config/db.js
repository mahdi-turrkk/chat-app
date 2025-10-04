import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

const db = new sqlite.Database("chatApp.db", (err) => {
    if (err) console.error("Database connection error:", err);
    else console.log("Connected to the database");
});

export default db;