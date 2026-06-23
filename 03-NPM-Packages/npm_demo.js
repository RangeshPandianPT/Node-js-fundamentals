const chalk = require('chalk');

console.log(chalk.blue('Hello world!'));
console.log(chalk.blue.bgRed.bold('Hello world!'));
console.log(chalk.blue('I am a blue line ' + chalk.red.underline.bold('with a red substring') + ' that becomes blue again!'));
console.log(`
CPU: ${chalk.red('90%')}
RAM: ${chalk.green('40%')}
DISK: ${chalk.yellow('70%')}
`);

console.log(chalk.green('\n✅ Success! NPM packages (like chalk) are working properly.'));
