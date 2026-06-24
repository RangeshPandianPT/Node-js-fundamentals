const fs = require('fs').promises;
const path = require('path');

// Async/Await is syntax sugar over Promises, introduced in ES2017.
// It allows us to write asynchronous code that looks and behaves like synchronous code.

const filePath = path.join(__dirname, '..', 'package.json');

// To use await, we must be inside an "async" function.
async function readPackageJson() {
    console.log('1. Starting to read file using Async/Await...');

    try {
        // The "await" keyword pauses the execution of this function 
        // until the Promise resolves, then returns the resolved value.
        const data = await fs.readFile(filePath, 'utf8');
        
        console.log('2. Successfully read file!');
        console.log('   File size:', data.length, 'bytes');
        
        return data; // This will become the resolved value of the Promise returned by this function
    } catch (err) {
        // We use standard try/catch blocks for error handling!
        console.error('Error reading file:', err);
    } finally {
        console.log('   Finished processing (success or fail).');
    }
}

// Calling the async function returns a Promise
console.log('0. Before calling the async function');
readPackageJson().then(() => {
    console.log('4. Async function completed entirely');
});
console.log('3. This prints BEFORE the file reading inside the async function is complete.');

// Modern Node.js supports "Top-Level Await" in ES Modules (.mjs files or "type": "module" in package.json)
// but in standard CommonJS, you must wrap await inside an async function as shown above.
