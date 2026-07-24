// Note: Adjust the path to Data.js depending on where it resides relative to this file
const { people, listPeople, addPerson, findByName } = require('../../Data.js');

// Controller functions handle the logic for each route

const getAllPeople = (req, res) => {
    res.json(listPeople());
};

const getPersonByName = (req, res) => {
    const person = findByName(req.params.name);
    if (!person) {
        return res.status(404).json({ error: 'Person not found.' });
    }
    res.json(person);
};

const createPerson = (req, res) => {
    const { name, age, city } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const newPerson = addPerson({ name, age, city });
        res.status(201).json(newPerson);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

module.exports = {
    getAllPeople,
    getPersonByName,
    createPerson
};
