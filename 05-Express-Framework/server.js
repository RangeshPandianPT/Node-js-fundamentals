const express = require('express');
const { people, listPeople, addPerson, findByName } = require('../Data.js');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to the Express.js API! Check out /api/people');
});

// GET all people
app.get('/api/people', (req, res) => {
    res.json(listPeople());
});

// GET a specific person by name
app.get('/api/people/:name', (req, res) => {
    const person = findByName(req.params.name);
    if (!person) return res.status(404).send('Person not found.');
    res.json(person);
});

// POST a new person
app.post('/api/people', (req, res) => {
    try {
        const newPerson = addPerson({
            name: req.body.name,
            age: req.body.age,
            city: req.body.city
        });
        res.status(201).json(newPerson);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express Server is running on http://localhost:${PORT}`);
    console.log(`Try accessing http://localhost:${PORT}/api/people`);
});
