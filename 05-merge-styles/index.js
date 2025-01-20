const fs = require('fs').promises;
const path = require('path');

const stylesDir = path.join(__dirname, 'styles');
const bundleFile = path.join(__dirname, 'project-dist', 'bundle.css');

const bundleStyles = async (src, bundleFile) => {
  try {
    await fs.stat(src);
    await fs.writeFile(bundleFile, '');

    const files = await fs.readdir(src, { withFileTypes: true });
    const styleFiles = files
      .filter((file) => file.isFile() && path.extname(file.name) === '.css')
      .sort();

    for (const file of styleFiles) {
      const filePath = path.join(src, file.name);
      const content = await fs.readFile(filePath, 'utf8');
      await fs.appendFile(bundleFile, content + '\n');
    }
  } catch (err) {
    throw new Error('FS operation failed');
  }
};

(async () => {
  try {
    await fs.access(stylesDir, fs.constants.F_OK);
    await bundleStyles(stylesDir, bundleFile);
  } catch (err) {
    console.error(err.message);
  }
})();
