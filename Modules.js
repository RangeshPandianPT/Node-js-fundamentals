// const imports  = require('./Data.js');

const {names , ages, cities} = require('./Data.js');
const imports = require('./Data.js');

console.log(imports);
console.log(imports.name);
console.log(imports.age);
console.log(imports.city);

const os = require('os');
console.log(os.platform());
console.log(os.homedir());

// 1. Basic Node.js Server (Backend)
// This example creates a simple Node.js server using the Express framework that responds with "Hello from our server!" when accessed.
// // index.js (Node.js backend)
const express = require('express');
const app = express();
const cors = require('cors'); 

app.use(cors()); 

app.get('/', (req, res) => {
  res.send('Hello from our server!');
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



// Node.js Backend (server.js):
// JavaScript
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/api/message', (req, res) => {
  res.json({ message: 'Data from Node.js backend!' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

