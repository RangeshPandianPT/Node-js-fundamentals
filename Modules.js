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

