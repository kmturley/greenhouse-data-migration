#!/usr/bin/env node

const chalk = require('chalk');
const co = require('co');
const mkdirp = require('mkdirp');
const prompt = require('co-prompt');
const program = require('commander');
const slugify = require('slugify');

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

function download(urls, paginate) {
  return new Promise((resolve, reject) => {
    const promises = [];
    urls.forEach((url) => {
      if (paginate === true) {
        promises.push(api.getAllPages(`${api.getAPI()}/${url}`));
      } else {
        promises.push(api.get(`${api.getAPI()}/${url}`));
      }
    });
    Promise.all(promises).then((urlItems) => {
      resolve(urlItems);
    });
  });
}

function save(responses) {
  return new Promise((resolve, reject) => {
    const promises = [];
    responses.forEach((response) => {
      if (response.body) {
        const name = slugify(response.request.uri.href.replace(api.getAPI(), ''));
        promises.push(api.toJSON(`data/${name}.json`, response.body));
      } else {
        response.forEach((page) => {
          const name = slugify(page.url.replace(api.getAPI(), ''));
          promises.push(api.toJSON(`data/${name}.json`, page.data));
        });
      }
    });
    Promise.all(promises).then((urlItems) => {
      resolve(urlItems);
    });
  });
}

program
  .version(package.version)
  .arguments('<action>')
  .option('-t, --type <boolean>', 'Type')
  .option('-p, --paginate <boolean>', 'Paginate')
  .action((action) => {
    co(function* () {
      mkdirp('data', (error) => {
        if (action === 'download') {
          // const type = program.type ? program.type : yield prompt('Type: ');
          const paginate = program.paginate === 'true' ? true : false;
          const type = program.type;
          const urls = type === 'all' ? endpoints : [type];
          console.log('paginate', paginate, typeof paginate);
          download(urls, paginate).then((urlItems) => {
            save(urlItems).then((fileItems) => {
              success(`Urls: ${urlItems.length}, Saved: ${fileItems.length}`);
            });
          });
        } else {
          failure(`Error command not recognized`);
        }
      });
    });
  })
  .parse(process.argv);
