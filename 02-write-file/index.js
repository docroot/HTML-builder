const fs = require('fs');
const readline = require('readline');
const path = require('path');

const fileName = 'text.txt';
const fullPath = path.join(__dirname, fileName);

const outputStream = fs.createWriteStream(fullPath, { flags: 'a' }); // append mode

const rl = readline.createInterface({
  input: process.stdin,
});

const appendToFile = async (text) => {
  try {
    outputStream.write(text + '\n');
  } catch (err) {
    console.error('Error writing to file:', err.message);
  }
};

const exitProgram = () => {
  console.log('\nBye! Have a nice day!');
  outputStream.end();
  rl.close();
  process.exit();
};

process.on('SIGINT', exitProgram);
rl.on('SIGINT', exitProgram);

console.log('Welcome! Enter text (press Ctrl+C or "exit" to quit): ');

rl.on('line', async (input) => {
  if (input.toLowerCase() === 'exit') {
    exitProgram();
  }
  await appendToFile(input);
  console.log(
    'Text has been saved to file. Enter text (press Ctrl+C or "exit" to quit): ',
  );
});
