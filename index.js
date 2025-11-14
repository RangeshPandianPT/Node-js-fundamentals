// index.js - demo runner for the Node.js fundamentals examples in this repo
// This script demonstrates how to use `Data.js` without running other example files

const data = require('./Data.js');

console.log('==== people (initial) ====');
console.table(data.listPeople());

console.log('\nFind person by name: "Charlie"');
console.log(data.findByName('Charlie'));

console.log('\nAdd a new person:');
const added = data.addPerson({ name: 'Frank', age: 28, city: 'Seattle' });
console.log(added);

console.log('\n==== people (after add) ====');
console.table(data.listPeople());

console.log('\nNotes:');
console.log('- To run other examples in this folder execute them directly:');
console.log('  node Fs.js    # demonstrates fs operations (creates ./docs)');
console.log('  node Hello.js # demonstrates timers and __dirname/__filename');
console.log('  node Modules.js # prints requires (this file references express and may require dependencies)');

console.log('\nEnd of demo.');
