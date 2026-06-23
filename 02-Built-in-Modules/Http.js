const http = require('http');

const PORT = 3000;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Set the response HTTP header with HTTP status and Content type
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // Routing based on the URL
  if (req.url === '/') {
    res.end('Welcome to the Node.js Fundamentals HTTP Server!\n');
  } else if (req.url === '/about') {
    res.end('This is the about page.\n');
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
