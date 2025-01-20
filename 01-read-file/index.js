const fs = require('fs');
const path = require('path');
const fileName = 'text.txt';

const read = async () => {
  const fullPath = path.join(__dirname, fileName);

  const inputStream = fs.createReadStream(fullPath);

  inputStream.pipe(process.stdout);
};

(async () => {
  await read();
})();
