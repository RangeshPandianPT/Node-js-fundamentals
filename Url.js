const url = require('url');

console.log('--- URL Module Examples ---\n');

const myUrlString = 'https://www.example.com:8080/path/to/resource?name=JohnDoe&age=30#section1';

console.log(`Original URL string: ${myUrlString}\n`);

// Using the modern WHATWG URL API
const myUrl = new URL(myUrlString);

console.log('Parsed URL Object (WHATWG):');
console.log(`Href: ${myUrl.href}`);
console.log(`Protocol: ${myUrl.protocol}`);
console.log(`Host: ${myUrl.host}`);
console.log(`Hostname: ${myUrl.hostname}`);
console.log(`Port: ${myUrl.port}`);
console.log(`Pathname: ${myUrl.pathname}`);
console.log(`Search: ${myUrl.search}`);
console.log(`Hash: ${myUrl.hash}\n`);

// Working with SearchParams
console.log('Working with URLSearchParams:');
console.log(`Name parameter: ${myUrl.searchParams.get('name')}`);
console.log(`Age parameter: ${myUrl.searchParams.get('age')}`);

myUrl.searchParams.append('active', 'true');
console.log(`\nModified URL with new parameter: ${myUrl.href}`);

// Format URL using legacy url module (for comparison, mostly deprecated but good to know)
const legacyUrl = url.parse(myUrlString, true);
console.log('\nLegacy url.parse():');
console.log(`Pathname: ${legacyUrl.pathname}`);
console.log(`Query Object:`, legacyUrl.query);

module.exports = {
  myUrl
};
