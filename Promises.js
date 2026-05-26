// Promises.js
// Modern Node.js extensively uses Promises and async/await, especially in modules like fs/promises.

const fs = require('fs/promises');
const path = require('path');

console.log('--- Async/Await and Promises in Node.js ---');

async function runAsyncExample() {
    const filePath = path.join(__dirname, 'async_file.txt');

    try {
        // 1. Write to a file asynchronously
        console.log('Writing to file...');
        await fs.writeFile(filePath, 'Hello, this is async/await in Node.js!');
        
        // 2. Read from the file asynchronously
        console.log('Reading from file...');
        const data = await fs.readFile(filePath, 'utf8');
        console.log(`\nFile Content:\n${data}`);

        // 3. Clean up: Delete the file
        console.log('\nDeleting the file...');
        await fs.unlink(filePath);
        console.log('File deleted successfully.');

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

runAsyncExample();
