// Simple data module used by the learning examples in this repo.
// Exports arrays and a small in-memory `people` list with helper utilities.

const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
const ages = [25, 30, 35, 40, 45];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

// Build a derived people array so callers can work with objects
const people = names.map((name, i) => ({ name, age: ages[i], city: cities[i] }));

function findByName(name) {
    if (!name) return null;
    return people.find(p => p.name.toLowerCase() === String(name).toLowerCase()) || null;
}

function addPerson({ name, age, city }) {
    if (!name) throw new Error('name is required');
    const p = { name, age: age ?? null, city: city ?? null };
    people.push(p);
    return p;
}

function listPeople() {
    // return a shallow copy to avoid accidental external mutation
    return people.slice();
}

module.exports = {
    names,
    ages,
    cities,
    people,
    findByName,
    addPerson,
    listPeople,
};

