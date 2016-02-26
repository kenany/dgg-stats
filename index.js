'use strict';

const eachAsync = require('async-each-series');
const logs = require('overrustle-logs');
const cuid = require('cuid');
const level = require('level');
const moment = require('moment');
const path = require('path');
const streamEach = require('stream-each');

const db = level(path.resolve(__dirname, 'db'), {valueEncoding: 'json'});

const dates = [];
const date = moment.utc();
while (date.isAfter(moment.utc().subtract(1, 'month'))) {
  dates.push(date.toISOString());
  date.subtract(1, 'day');
}

eachAsync(dates, (date, done) => {
  console.log(date);
  const ops = [];

  function onData(data, next) {
    ops.push({
      type: 'put',
      key: cuid(),
      value: data
    });

    next();
  }

  function onEnd() {
    console.log(`batching up ${ops.length} ops`);
    db.batch(ops, done);
  }

  streamEach(logs({
    channel: 'Destinygg',
    date: date
  }), onData, onEnd);
}, error => {
  if (error) {
    throw error;
  }

  console.log('done');
});
