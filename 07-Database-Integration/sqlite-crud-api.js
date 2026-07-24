const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

// Connect to Database
const dbPath = path.join(__dirname, 'crud-api.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error connecting to SQLite:', err.message);
    else {
        console.log('✅ Connected to SQLite database.');
        // Create table
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )`);
    }
});

// GET all items
app.get('/api/items', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST new item
app.post('/api/items', (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, description });
    });
});

// GET single item
app.get('/api/items/:id', (req, res) => {
    db.get('SELECT * FROM items WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item not found' });
        res.json(row);
    });
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
    const { name, description } = req.body;
    db.run('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item updated successfully' });
    });
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
    db.run('DELETE FROM items WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// Run server if called directly
if (require.main === module) {
    app.listen(PORT, () => console.log(`SQLite CRUD API running on http://localhost:${PORT}`));
}

module.exports = app;
