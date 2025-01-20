const fs = require('fs').promises;
const path = require('path');

const dirName = 'secret-folder';
const fullPath = path.join(__dirname, dirName);

const ls = async (dirPath) => {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(dirPath, file.name);
        const stats = await fs.stat(filePath);
        const fileName = path.parse(file.name).name;
        const fileExt = path.extname(file.name).slice(1);
        const fileSize = (stats.size / 1024).toFixed(1);

        console.log(`${fileName} - ${fileExt} - ${fileSize} KiB`);
      }
    }
  } catch (err) {
    throw new Error('FS operation failed');
  }
};

(async () => {
  await ls(fullPath);
})();
