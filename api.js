
const credentials = require('./credentials.json');
const fs = require('fs');
const json2csv = require('json2csv').parse;
const requestPromise = require('request-promise');

const domain = credentials.domain || console.error('Please set your domain in credentials.json');
const token = credentials.token || console.error('Please set your token in credentials.json');
const root = credentials.root || console.error('Please set your API root in credentials.json');

exports.getDomain = function() {
  return `https://${domain}`;
}

exports.getAPI = function() {
  return `https://${domain}/${root}`;
}

exports.get = function(url) {
  console.log('api.get', url);
  return requestPromise.get({
    uri: url,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(token + ':').toString('base64')
    },
    json: true
  }).catch((error) => {
    console.error(error.options.uri, error.name, error.statusCode, error.message);
  });
};

exports.post = function(url, params) {
  console.log('api.post', `${this.getAPI()}/${url}`, params);
  return requestPromise.post({
    uri: `${this.getAPI()}/${url}`,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(token + ':').toString('base64')
    },
    json: true,
    body: params
  }).catch((error) => {
    console.error(error.options.uri, error.name, error.statusCode, error.message);
  });
};

exports.toCSV = function(dataset) {
  var headers = Object.keys(dataset[0]);
  try {
    console.log('api.toCSV', dataset.length);
    return json2csv(dataset, { headers });
  } catch (error) {
    console.error(error);
  }
};

exports.toJSON = function(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data, null, 4), 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        console.log('api.toJSON', path);
        resolve(path);
      }
    });
  });
}
