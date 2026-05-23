const EventEmitter = require('events');

// Create a custom class that extends EventEmitter
class MyEmitter extends EventEmitter {}

// Instantiate the custom emitter
const myEmitter = new MyEmitter();

// Register a listener for the 'greet' event
myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Register a listener for a 'data' event
myEmitter.on('data', (data) => {
  console.log(`Received data: ${JSON.stringify(data)}`);
});

// Register a one-time listener
myEmitter.once('init', () => {
  console.log('Initialization complete (this will only run once).');
});

console.log('--- Event Emitter Examples ---');

// Emit the 'init' event twice, but it will only fire once
myEmitter.emit('init');
myEmitter.emit('init');

// Emit the 'greet' event with an argument
myEmitter.emit('greet', 'Alice');
myEmitter.emit('greet', 'Bob');

// Emit the 'data' event with an object
myEmitter.emit('data', { id: 1, message: 'Node.js is awesome!' });

module.exports = myEmitter;
