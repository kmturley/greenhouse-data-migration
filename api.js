const credentials = require('./credentials.json');
const parse = require('parse-link-header');
const request = require('sync-request');
const url = require('url');

const domain = credentials.domain || console.error('Please set your domain in credentials.json');
const token = credentials.token || console.error('Please set your token in credentials.json');
const root = credentials.root || console.error('Please set your API root in credentials.json');
const options = {
  headers: {
    'Authorization': 'Basic ' + Buffer.from(token + ':').toString('base64')
  }
};

function getDomain() {
  return `https://${domain}`;
}

function getAPI() {
  return `https://${domain}/${root}`;
}

function addDefaultParams(path) {
  const obj = url.parse(path, true);
  if (!obj.query.page) {
    obj.query.page = 1;
  }
  if (!obj.query.per_page) {
    obj.query.per_page = 500;
  }
  return `${obj.pathname}?page=${obj.query.page}&per_page=${obj.query.per_page}`;
}

async function get(url, auth) {
  console.log('api.get', url);
  return await request('GET', url, auth === false ? null : options).getBody('utf8');
};

async function getRaw(url, auth) {
  console.log('api.getRaw', url);
  return await request('GET', url, auth === false ? null : options).body;
};

async function getJSON(url) {
  console.log('api.getJSON', `${this.getAPI()}/${url}`);
  return JSON.parse(await get(`${this.getAPI()}/${url}`));
};

async function getJSONPage(url) {
  console.log('api.getJSONPage', url);
  return {
    url: `${this.getAPI()}/${url}`,
    data: await this.getJSON(url)
  };
};

async function getJSONPages(url, responses) {
  console.log('api.getJSONPages', url);
  const response = request('GET', `${this.getAPI()}/${url}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(token + ':').toString('base64')
    }
  });
  if (!responses) {
    responses = [];
  }
  responses.push({
    url: url,
    data: JSON.parse(response.getBody('utf8'))
  });
  if (response.headers && response.headers.link) {
    const link = parse(response.headers.link);
    if (link.next && link.next.url) {
      const nextUrl = link.next.url.replace(this.getAPI() + '/', '');
      return await this.getJSONPages(nextUrl, responses);
    }
  }
  return responses;
};

module.exports.getDomain = getDomain;
module.exports.getAPI = getAPI;
module.exports.addDefaultParams = addDefaultParams;
module.exports.get = get;
module.exports.getRaw = getRaw;
module.exports.getJSON = getJSON;
module.exports.getJSONPage = getJSONPage;
module.exports.getJSONPages = getJSONPages;
