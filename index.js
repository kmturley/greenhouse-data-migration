#!/usr/bin/env node

const chalk = require('chalk');
const co = require('co');
const mkdirp = require('mkdirp');
const prompt = require('co-prompt');
const program = require('commander');

const api = require('./api.js');
const package = require('./package.json');

const endpoints = [
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

function download(urls) {
  return new Promise((resolve, reject) => {
    const promises = [];
    urls.forEach((url) => {
      promises.push(api.get(`${api.getAPI()}/${url}/`));
    });
    Promise.all(promises).then((urlItems) => {
      resolve(urlItems);
    });
  });
}

function save(urls, urlItems) {
  return new Promise((resolve, reject) => {
    const promises = [];
    urlItems.forEach((urlItem, urlItemIndex) => {
      const url = urls[urlItemIndex];
      const slug = url.replace('/', '-');
      promises.push(api.toJSON(`data/${slug}.json`, urlItem));
    });
    Promise.all(promises).then((fileItems) => {
      resolve(fileItems);
    });
  });
}

program
  .version(package.version)
  .arguments('<action>')
  .option('-t, --type <boolean>', 'Type')
  .action((action) => {
    co(function* () {
      mkdirp('data', (error) => {
        if (action === 'download') {
          // const type = program.type ? program.type : yield prompt('Type: ');
          const type = program.type;
          const urls = type === 'all' ? endpoints : [type];
          download(urls).then((urlItems) => {
            save(urls, urlItems).then((fileItems) => {
              success(`Downloaded: ${urlItems.length}, Saved: ${fileItems.length}`);
            });
          });
        } else {
          failure(`Error command not recognized`);
        }
      });
    });
  })
  .parse(process.argv);
