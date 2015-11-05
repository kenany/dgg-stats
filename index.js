const eachAsync = require('async-each-series');
const logs = require('overrustle-logs');
const cuid = require('cuid');
const level = require('level');
const moment = require('moment');

var db = level('./db', {valueEncoding: 'json'});

var dates = [];
var date = moment.utc();
while (date.isAfter(moment.utc().subtract(1, 'month'))) {
  dates.push(date.toISOString());
  date.subtract(1, 'day');
}

eachAsync(dates, (date, done) => {
  console.log(date);
  var ops = [];
  logs({
    channel: 'Destinygg',
    date: date
  })
  .on('data', data => {
    ops.push({
      type: 'put',
      key: cuid(),
      value: data
    });
  })
  .on('end', () => {
    console.log('batching up ' + ops.length + ' ops');
    db.batch(ops, done);
  });
}, error => {
  if (error) {
    throw error;
  }

  console.log('done');
});
