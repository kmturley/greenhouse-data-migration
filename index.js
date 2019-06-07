#!/usr/bin/env node

const chalk = require('chalk');
const co = require('co');
const mkdirp = require('mkdirp');
const prompt = require('co-prompt');
const program = require('commander');
const slugify = require('slugify');
const url = require('url');

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

function addDefaultParams(path) {
  const pathObj = url.parse(path, true);
  if (!pathObj.query.page) {
    pathObj.query.page = 1;
  }
  if (!pathObj.query.per_page) {
    pathObj.query.per_page = 500;
  }
  return `${pathObj.pathname}?page=${pathObj.query.page}&per_page=${pathObj.query.per_page}`;
}

function download(paths, paginate) {
  return new Promise((resolve, reject) => {
    const promises = [];
    paths.forEach((path) => {
      if (paginate === true) {
        promises.push(api.getAllPages(addDefaultParams(path)));
      } else {
        promises.push(api.get(addDefaultParams(path)));
      }
    });
    Promise.all(promises).then((pathItems) => {
      resolve(pathItems);
    });
  });
}

function createFilename(name) {
  return slugify(name.replace(api.getAPI() + '/', '').replace('page=', '_').replace('per_page=500', '').replace('per_page=100', '').replace('?', '').replace('&', ''));
}

function save(responses) {
  return new Promise((resolve, reject) => {
    const promises = [];
    responses.forEach((response) => {
      if (response.body) {
        promises.push(api.toJSON(`data/${createFilename(response.request.uri.href)}.json`, response.body));
      } else {
        response.forEach((page) => {
          promises.push(api.toJSON(`data/${createFilename(page.url)}.json`, page.data));
        });
      }
    });
    Promise.all(promises).then((urlItems) => {
      resolve(urlItems);
    });
  });
}

function downloadAttachments(path) {
  return new Promise((resolve, reject) => {
    const promises = [];
    console.log('downloadAttachments', path);
    mkdirp(`./data/attachments/${path}`, (error) => {
      api.fromJSON(`./data/${path}.json`).then((candidates) => {
        candidates.forEach((candidate) => {
          candidate.attachments.forEach((attachment, attachmentIndex) => {
            const ext = attachment.filename.split('.').pop();
            promises.push(api.download(`./data/attachments/${path}/${candidate.id}_${attachmentIndex + 1}.${ext}`, attachment.url));
          });
        });
        Promise.all(promises).then((attachmentItems) => {
          resolve(attachmentItems);
        });
      });
    });
  });
}

function downloadAttachmentsAll(fileItems) {
  return new Promise((resolve, reject) => {
    const promises = [];
    fileItems.forEach((fileItem) => {
      const path = fileItem.replace('data/', '').replace('.json', '');
      promises.push(downloadAttachments(path));
    });
    Promise.all(promises).then((attachmentItems) => {
      resolve(attachmentItems);
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
        // const type = program.type ? program.type : yield prompt('Type: ');
        const paginate = program.paginate === 'true' ? true : false;
        const type = program.type;
        if (action === 'download') {
          const urls = type === 'all' ? endpoints : [type];
          download(urls, paginate).then((urlItems) => {
            save(urlItems).then((fileItems) => {
              if (type === 'candidates') {
                downloadAttachmentsAll(fileItems).then((attachmentItems) => {
                  success(`Urls: ${urlItems.length}, Saved: ${fileItems.length}, Attachments: ${attachmentItems.length}`);
                });
              } else {
                success(`Urls: ${urlItems.length}, Saved: ${fileItems.length}`);
              }
            });
          });
        } else if (action === 'download-attachments') {
          downloadAttachments(type).then((attachmentItems) => {
            success(`Attachments: ${attachmentItems.length}`);
          });
        } else {
          failure(`Error command not recognized`);
        }
      });
    });
  })
  .parse(process.argv);
