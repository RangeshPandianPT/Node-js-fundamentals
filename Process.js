// Process.js
// The process object provides information about, and control over, the current Node.js process.
// It is a global object, accessible anywhere in your code.

console.log('--- Node.js Process Object ---');

// 1. Process Environment Variables
console.log('Current Environment (NODE_ENV):', process.env.NODE_ENV || 'Not set');

// 2. Command Line Arguments
console.log('\nCommand Line Arguments:');
process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});

// 3. Current Working Directory
console.log('\nCurrent Working Directory:', process.cwd());

// 4. Memory Usage
console.log('\nMemory Usage:');
console.log(process.memoryUsage());

// 5. Uptime
console.log(`\nProcess has been running for ${process.uptime()} seconds.`);

// 6. Process exit event
process.on('exit', (code) => {
    console.log(`\nProcess is exiting with code: ${code}`);
});

// You could force exit the process with: process.exit(0);
