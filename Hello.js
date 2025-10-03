const hello = (hname) => {
    console.log (`Hello, ${hname}!`);
}

// console.log(global);

setTimeout(() => {
    console.log("this is a timeout");
    clearInterval(intfunc);
}, 5000);

const intfunc = setInterval(() => {
    console.log("this is an interval");
}, 1000);

hello("World");

console.log(__dirname);
console.log(__filename);

