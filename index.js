#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');

const api = require('./api.js');
const file = require('./file.js');
const package = require('./package.json');

const FOLDER = 'data';
const ENDPOINTS = [
  'applications',
  'candidates',
  'close_reasons',
  'degrees',
  'demographics/questions',
  'departments',
  'eeoc',
  'email_templates',
  'job_posts',
  'job_stages',
  'jobs',
  'offers',
  'offices',
  'rejection_reasons',
  'scheduled_interviews',
  'scorecards',
  'sources',
  'users',
  'user_roles',
];

function success(msg) {
  console.log(`-------`);
  console.log(chalk.green(msg));
  process.exit(1);
}

function failure(msg) {
  console.log(`-------`);
  console.log(chalk.red(msg));
  process.exit(0);
}

async function init(action) {
  const paginate = program.paginate === 'true' ? true : false;
  const type = program.type;
  await file.createDirectory(FOLDER);
  if (action === 'download') {
    const urls = type === 'all' ? ENDPOINTS : [type];
    for (const url of urls) {
      if (paginate === true) {
        pages = await api.getJSONPages(api.addDefaultParams(url));
      } else {
        pages = [await api.getJSONPage(api.addDefaultParams(url))];
      }
      for (const page of pages) {
        await file.createFileJson(`${FOLDER}/${file.createFilename(page.url)}.json`, page.data);
      }
      success(`Urls: ${urls.length}, Pages: ${pages.length}`);
    }
  } else if (action === 'download-attachments') {
    await file.createDirectory(`${FOLDER}/attachments`);
    await file.createDirectory(`${FOLDER}/attachments/${type}`);
    const candidates = await file.loadFileJson(`./${FOLDER}/${type}.json`);
    for (const candidate of candidates) {
      let attachmentIndex = 0;
      for (const attachment of candidate.attachments) {
        const ext = attachment.filename.split('.').pop();
        const data = await api.getRaw(attachment.url, false);
        await file.createFile(`${FOLDER}/attachments/${type}/${candidate.id}_${attachmentIndex + 1}.${ext}`, data);
        attachmentIndex += 1;
      }
    }
  } else if (action === 'download-activities') {
    await file.createDirectory(`${FOLDER}/activities`);
    await file.createDirectory(`${FOLDER}/activities/${type}`);
    const candidates = await file.loadFileJson(`./${FOLDER}/${type}.json`);
    for (const candidate of candidates) {
      const json = await api.getJSON(`candidates/${candidate.id}/activity_feed`);
      await file.createFileJson(`${FOLDER}/activities/${candidate.id}.json`, json);
    }
  } else {
    failure(`Error command not recognized`);
  }
  return true;
}

program
  .version(package.version)
  .arguments('<action>')
  .option('-t, --type <boolean>', 'Type')
  .option('-p, --paginate <boolean>', 'Paginate')
  .action(init)
  .parse(process.argv);
