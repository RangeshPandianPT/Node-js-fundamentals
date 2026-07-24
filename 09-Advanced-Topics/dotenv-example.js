// Note: You need to install dotenv first using: npm install dotenv
require('dotenv').config();

console.log('--- Environment Variables Demo (dotenv) ---\n');

// Access variables defined in the .env file
const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set
const NODE_ENV = process.env.NODE_ENV;
const API_KEY = process.env.API_KEY;

console.log(`Server will run on PORT: ${PORT}`);
console.log(`Current Environment: ${NODE_ENV}`);

// Never log production API keys in real apps, this is just for learning!
if (NODE_ENV === 'development') {
    console.log(`Using API Key: ${API_KEY}`);
} else {
    console.log(`Using API Key: [HIDDEN IN PRODUCTION]`);
}

console.log('\n----------------------------------------\n');
