const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const src = path.join(__dirname, 'files');
const dst = path.join(__dirname, 'files-copy');

const copyFile = async (srcPath, dstPath) => {
  try {
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(dstPath);
    await pipeline(readStream, writeStream);
  } catch (err) {
    throw new Error(`Error copying file ${srcPath}: ${err.message}`);
  }
};

const copyDir = async (src, dst) => {
  try {
    await fs.promises.stat(src);

    await fs.promises.mkdir(dst, { recursive: true });

    const files = await fs.promises.readdir(src);

    const copyPromises = files.map((file) => {
      const srcPath = path.join(src, file);
      const dstPath = path.join(dst, file);
      return copyFile(srcPath, dstPath);
    });

    await Promise.all(copyPromises);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('Copying failed');
    }
    throw err;
  }
};

(async () => {
  try {
    await fs.promises.access(src, fs.constants.F_OK);
    try {
      await fs.promises.access(dst, fs.constants.F_OK);
      await fs.promises.rm(dst, { recursive: true });
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    await copyDir(src, dst);
  } catch (err) {
    console.error(err.message);
  }
})();
