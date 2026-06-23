const { exec, spawn } = require('child_process');
const os = require('os');

console.log('--- Child Process Module Examples ---\n');

// 1. exec() - good for short running commands, buffers output
console.log('1. Using exec() to run a shell command:');
const command = os.platform() === 'win32' ? 'dir' : 'ls -la';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`exec stdout:\n${stdout}`);
});

// 2. spawn() - good for long running commands, streams output
console.log('2. Using spawn() to stream command output:');
const spawnCommand = os.platform() === 'win32' ? 'cmd.exe' : 'ls';
const spawnArgs = os.platform() === 'win32' ? ['/c', 'echo Hello from spawn!'] : ['-la'];

const child = spawn(spawnCommand, spawnArgs);

child.stdout.on('data', (data) => {
  console.log(`spawn stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`spawn stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`spawn child process exited with code ${code}`);
});
