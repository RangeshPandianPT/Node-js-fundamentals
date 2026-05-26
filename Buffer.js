// Buffer.js
// Buffers in Node.js are used to handle binary data.
// They are arrays of integers and correspond to raw memory allocations outside the V8 heap.

console.log('--- Node.js Buffers ---');

// 1. Create a buffer of size 10 bytes (uninitialized)
const buf1 = Buffer.alloc(10);
console.log('Allocated Buffer:', buf1);

// 2. Create a buffer from a string
const buf2 = Buffer.from('Hello Node.js');
console.log('\nBuffer from string:', buf2);
console.log('Buffer to string:', buf2.toString());
console.log('Buffer to hex:', buf2.toString('hex'));
console.log('Buffer to base64:', buf2.toString('base64'));

// 3. Modify a buffer
buf1.write('Node');
console.log('\nModified buf1:', buf1.toString());

// 4. Concatenate buffers
const buf3 = Buffer.concat([Buffer.from('Hello '), Buffer.from('World!')]);
console.log('\nConcatenated Buffer:', buf3.toString());
