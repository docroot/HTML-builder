const fs = require('fs').promises;
const fss = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const distDir = path.join(__dirname, 'project-dist');

const templatePath = path.join(__dirname, 'template.html');
const componentsDir = path.join(__dirname, 'components');

const stylesDir = path.join(__dirname, 'styles');
const bundleFile = path.join(distDir, 'style.css');
const assetsSrcDir = path.join(__dirname, 'assets');
const assetsDstDir = path.join(distDir, 'assets');

const processTemplate = async (templatePath, componentsDir, distDir) => {
  try {
    const template = await fs.readFile(templatePath, 'utf-8');

    const files = await fs.readdir(componentsDir, { withFileTypes: true });
    const componentFiles = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.html',
    );
    let result = template;
    for (const file of componentFiles) {
      const component = path.parse(file.name).name;
      const componentPath = path.join(componentsDir, file.name);
      const componentContent = await fs.readFile(componentPath, 'utf-8');
      const componentTag = `{{${component}}}`;
      result = result.replaceAll(componentTag, componentContent);
    }

    const outputPath = path.join(distDir, 'index.html');
    await fs.writeFile(outputPath, result);
  } catch (err) {
    throw new Error(`Template processing failed: ${err.message}`);
  }
};

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
    console.error(err.message);
    throw new Error('FS operation failed');
  }
};

const copyFile = async (srcPath, dstPath) => {
  try {
    const readStream = fss.createReadStream(srcPath);
    const writeStream = fss.createWriteStream(dstPath);
    await pipeline(readStream, writeStream);
  } catch (err) {
    throw new Error(`Error copying file ${srcPath}: ${err.message}`);
  }
};

const copyDir = async (src, dst) => {
  try {
    await fs.stat(src);

    try {
      await fs.access(dst, fs.constants.F_OK);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(dst, { recursive: true });
      } else {
        throw err;
      }
    }
    const files = await fs.readdir(src, { withFileTypes: true });

    for (const file of files) {
      const srcPath = path.join(src, file.name);
      const dstPath = path.join(dst, file.name);

      if (file.isDirectory()) {
        await copyDir(srcPath, dstPath);
      } else {
        await copyFile(srcPath, dstPath);
      }
    }

    const srcFiles = new Set(files.map((file) => file.name));
    const dstFiles = await fs.readdir(dst, { withFileTypes: true });
    for (const file of dstFiles) {
      if (!srcFiles.has(file.name)) {
        const filePath = path.join(dst, file.name);
        if (file.isDirectory()) {
          await fs.rm(filePath, {
            recursive: true,
            force: true,
          });
        } else {
          await fs.unlink(filePath);
        }
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('Copying failed');
    }
    throw err;
  }
};

(async () => {
  try {
    await fs.access(distDir, fs.constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(distDir, { recursive: true });
    } else {
      throw err;
    }
  }

  try {
    await processTemplate(templatePath, componentsDir, distDir);
    await bundleStyles(stylesDir, bundleFile);
    await copyDir(assetsSrcDir, assetsDstDir);
  } catch (err) {
    console.error(err.message);
  }
})();
