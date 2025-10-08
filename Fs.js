// FS - File System 

const fs = require('fs');

if ( ! fs.existsSync('./docs')) {
//mkdir - make directory
fs.mkdir('./docs', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Folder created');
    }
});

console.log('Folder already exists');
}

fs.writeFile('./docs/file.txt', 'Hello, this is a test', (err) => {
    if (err){
        console.log(err.message);
    }
    else {
        console.log('File written');
    }
});

fs.appendFile('./docs/file.txt', '\n\nThis is an appended text', () => {
    console.log('File was appended');
}); 

fs.readFile('./docs/file.txt',(err, data) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(data.toString());
    }
});

// One more way to read file

/*
fs.readFile('./docs/file.txt', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(data);
    }
});
*/

// remove the the directory
if (fs.existsSync('./docs/file.txt')) {
fs.rmdir('./docs', (err) => {
    if (err) {
        console.log(err.message);
    } 
    else {
        console.log('Folder removed');
    }
});
}


  
