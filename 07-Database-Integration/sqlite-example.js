const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to (or create) a file-based SQLite database
const dbPath = path.join(__dirname, 'test.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error connecting to SQLite:', err.message);
    }
    console.log('✅ Connected to SQLite database.');
});

// Run CRUD operations in a serialized block to ensure sequence
db.serialize(() => {
    // --- CREATE TABLE ---
    console.log('\n--- Creating Table ---');
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`);
    console.log('Table "users" ensured to exist.');

    // --- INSERT ---
    console.log('\n--- Inserting Data ---');
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const testEmail = `test_${Date.now()}@example.com`;
    stmt.run('Bob Johnson', testEmail, function (err) {
        if (err) return console.error(err.message);
        console.log(`Inserted user with rowid ${this.lastID}`);
        
        // --- READ ---
        console.log('\n--- Reading Data ---');
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) throw err;
            console.log(`Found ${rows.length} users.`);
            rows.forEach((row) => console.log(`${row.id}: ${row.name} - ${row.email}`));

            // --- DELETE ---
            console.log('\n--- Cleaning Up (Deleting last inserted) ---');
            db.run('DELETE FROM users WHERE id = ?', this.lastID, function (err) {
                if (err) return console.error(err.message);
                console.log(`Deleted ${this.changes} row(s).`);
                
                // Close the connection
                db.close((err) => {
                    if (err) return console.error(err.message);
                    console.log('\nClosed SQLite database connection.');
                });
            });
        });
    });
    stmt.finalize();
});
