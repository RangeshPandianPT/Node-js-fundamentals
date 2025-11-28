const fs = require('fs');

const readstream = fs.createReadStream('./docs/HugeFile.txt');
const writestream = fs.createWriteStream('./docs/HugeFile.txt');

readstream.on('data', (chunk) => {
    console.log('--- Chunk received ---');
    console.log(chunk.toString());
    writestream.write('\n\n New Chunk \n\n');
    writestream.write(chunk);
})