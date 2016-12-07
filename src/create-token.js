import fs from 'fs';
import {Token} from './models/models';
import uuid from 'uuid';
const mongoose = require('mongoose');
import babelPolyfill from 'babel-polyfill';

function readJsonFileSync(filepath, encoding){
  if (typeof (encoding) == 'undefined'){
      encoding = 'utf8';
  }
  const file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file) {
  const filepath = __dirname + '/../' + file;
  return readJsonFileSync(filepath);
}

const configuration = getConfig('config.json');

// Use native Node promises
mongoose.Promise = global.Promise;
mongoose.connect(configuration.database)
  .then(() =>  console.log('connection succesful'))
  .then(async () => {
    let id = uuid();
    const token = id.substring(0, 10);
    const newToken = new Token({value: token});
    try {
      await newToken.save();
      console.log('New token created: ', token);
    } catch(e) {
        console.log(e);
    }
    process.exit();
  })
  .catch(err => console.error(err));
