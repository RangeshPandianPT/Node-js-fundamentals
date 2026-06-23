const path = require('path');

console.log('--- Path Module Examples ---');

// 1. Get the base file name
const filePath = '/user/local/bin/file.txt';
console.log('Base name:', path.basename(filePath)); // file.txt

// 2. Get the directory name
console.log('Directory name:', path.dirname(filePath)); // /user/local/bin

// 3. Get the file extension
console.log('Extension name:', path.extname(filePath)); // .txt

// 4. Parse a path into an object
const parsedPath = path.parse(filePath);
console.log('Parsed path object:', parsedPath);

// 5. Join multiple path segments
const joinedPath = path.join(__dirname, 'docs', 'readme.md');
console.log('Joined path:', joinedPath);

// 6. Resolve to an absolute path
const resolvedPath = path.resolve('docs', 'readme.md');
console.log('Resolved absolute path:', resolvedPath);

// Export some examples for testing if needed
module.exports = {
  parsedPath,
  joinedPath,
  resolvedPath
};
