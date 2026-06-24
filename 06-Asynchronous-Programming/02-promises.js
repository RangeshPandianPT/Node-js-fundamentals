const fs = require('fs').promises; // Note we're using the promise-based version of fs
const path = require('path');

// Promises are a cleaner way to handle asynchronous operations compared to callbacks.
// A Promise represents the eventual completion (or failure) of an asynchronous operation.

const filePath = path.join(__dirname, '..', 'package.json');

console.log('1. Starting to read file using Promises...');

// fs.readFile returns a Promise now
fs.readFile(filePath, 'utf8')
    .then(data => {
        // This block executes when the promise resolves (success)
        console.log('2. Successfully read file!');
        console.log('   File size:', data.length, 'bytes');
        
        // We can chain promises by returning another promise
        return 'We can pass data to the next .then() block';
    })
    .then(message => {
        console.log('   Message from previous step:', message);
    })
    .catch(err => {
        // This block catches any error that occurs in the chain
        console.error('Error reading file:', err);
    })
    .finally(() => {
        // This block executes regardless of success or failure
        console.log('   Finished processing (success or fail).');
    });

console.log('3. This prints BEFORE the file reading is complete (Promises are still asynchronous).');

// Promises solve the "Callback Hell" problem by flattening the nested structure
// into a linear chain of .then() calls.
