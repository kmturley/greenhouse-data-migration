const api = require('./api.js');
const fs = require('fs');
const slugify = require('slugify');

async function createDirectory(path) {
  if (!fs.existsSync(path)) {
    return await fs.mkdirSync(path, { recursive: true });
  }
}

async function createFile(path, data) {
  return await fs.writeFileSync(path, data);
}

async function createFileJson(path, data) {
  return await createFile(path, JSON.stringify(data, null, 4));
}

function createFilename(name) {
  return slugify(name.replace(api.getAPI() + '/', '').replace('page=', '_').replace('per_page=500', '').replace('per_page=100', '').replace('?', '').replace('&', ''));
}

async function loadFile(path) {
  return await fs.readFileSync(path);
}

async function loadFileJson(path) {
  return JSON.parse(fs.readFileSync(path));
}

module.exports.createDirectory = createDirectory;
module.exports.createFile = createFile;
module.exports.createFileJson = createFileJson;
module.exports.createFilename = createFilename;
module.exports.loadFile = loadFile;
module.exports.loadFileJson = loadFileJson;
