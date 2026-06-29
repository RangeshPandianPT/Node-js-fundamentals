const http = require('http');

const PORT = 3000;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Routing based on the URL and Method
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to the Node.js Fundamentals HTTP Server!\n');
  } else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is the about page.\n');
  } else if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    
    // Listen for data chunks
    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });
    
    // Once all data is received
    req.on('end', () => {
      try {
        const parsedData = JSON.parse(body);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Data received successfully',
          data: parsedData
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found\n');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server.');
});

// Export the server in case we want to use it in index.js or tests
module.exports = server;
