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
  'prospect_pools',
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

function download(type) {
  api.get(`${api.getAPI()}/${type}/`).then((data) => {
    // console.log(type, data);
    type = type.replace('/', '-');
    api.toJSON(`data/${type}.json`, data, (path) => {
      // success(`Created file: ${path}`);
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
          if (type === 'all') {
            endpoints.forEach((endpoint) => {
              download(endpoint);
            });
          } else {
            download(type);
          }
        } else {
          failure(`Error command not recognized`);
        }
      });
    });
  })
  .parse(process.argv);
