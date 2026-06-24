const fs = require('fs');
const path = require('path');

// Callbacks are the traditional way of handling asynchronous operations in Node.js.
// When an operation completes, it calls a function (the callback) to report the result.

// Example: Reading a file asynchronously using a callback
const filePath = path.join(__dirname, '..', 'package.json');

console.log('1. Starting to read file using callback...');

fs.readFile(filePath, 'utf8', (err, data) => {
    // The convention in Node.js is "error-first callbacks".
    // The first argument is always the error (if any), and the second is the result.
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    console.log('2. Successfully read file!');
    console.log('   File size:', data.length, 'bytes');
});

console.log('3. This prints BEFORE the file reading is complete (because of asynchronous nature).');

// The Callback Hell problem:
// When you have multiple asynchronous operations that depend on each other,
// callbacks can become deeply nested and hard to read.
/*
fs.readFile('file1.txt', 'utf8', (err1, data1) => {
    fs.readFile(data1.trim(), 'utf8', (err2, data2) => {
        fs.readFile(data2.trim(), 'utf8', (err3, data3) => {
            console.log(data3);
        });
    });
});
*/
