const os = require('os');

console.log('--- OS Module Examples ---');

// Get system architecture
console.log(`Architecture: ${os.arch()}`);

// Get platform
console.log(`Platform: ${os.platform()}`);

// Get CPU core information
console.log(`CPU Cores: ${os.cpus().length}`);

// Get total system memory (in bytes)
const totalMem = os.totalmem();
const totalMemGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);
console.log(`Total Memory: ${totalMemGB} GB`);

// Get free system memory (in bytes)
const freeMem = os.freemem();
const freeMemGB = (freeMem / 1024 / 1024 / 1024).toFixed(2);
console.log(`Free Memory: ${freeMemGB} GB`);

// Get uptime of the system (in seconds)
const uptime = os.uptime();
const uptimeHours = (uptime / 3600).toFixed(2);
console.log(`System Uptime: ${uptimeHours} hours`);

// Get current user information
console.log('User Info:', os.userInfo());

module.exports = {
  arch: os.arch(),
  platform: os.platform(),
  totalMemGB,
  freeMemGB
};
