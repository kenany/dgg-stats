'use strict';

const level = require('level');
const path = require('path');
const h = require('virtual-dom/h');
const createElement = require('virtual-dom/create-element');
const inline = require('html-inline');
const fromString = require('from2-string');
const process = require('process');
const moment = require('moment');
const wordcount = require('wordcount');
const roundTo = require('round-to');
const streamEach = require('stream-each');

const topUsers = require('./lib/top-users');
const mostQuestions = require('./lib/most-questions');
const CommonWords = require('./lib/common-words');
const array2vdom = require('./lib/array-to-vdom-table');

const db = level(path.resolve(__dirname, 'db'), {valueEncoding: 'json'});

const users = {};
const words = new CommonWords();

function onData(data, next) {
  const time = moment.utc(data.timestamp, moment.ISO_8601);

  if (!users[data.user]) {
    users[data.user] = {
      lines: 0,
      avgWords: 0,
      quotes: [],
      latest: time,
      questions: 0
    };
  }

  users[data.user].lines++;

  // Cumulative moving average of the number of words in this user's messages.
  let avg = users[data.user].avgWords;
  avg += (wordcount(data.message) - avg) / users[data.user].lines;
  users[data.user].avgWords = avg;

  users[data.user].quotes.push(data.message);

  if (time.isAfter(users[data.user].latest)) {
    users[data.user].latest = time;
  }

  if (data.message.indexOf('?') !== -1) {
    users[data.user].questions++;
  }

  words.add(data.message);

  next();
}

function render() {
  const bigAsk = mostQuestions(users);

  const bigNumbers = h('table', [
    h('thead', [
      h('tr', [
        h('th', 'big numbers')
      ])
    ]),
    h('tbody', [
      h('tr', [
        h('td', `Why does ${bigAsk[0][0]} ask so many questions?
          ${roundTo(100 * bigAsk[0][1], 1)}% of their lines contained a
          question! ${bigAsk[1][0]} came in close second with
          ${roundTo(100 * bigAsk[1][1], 1)}% of their lines containing a
          question.`)
      ])
    ])
  ]);

  const rows = [['', 'word', 'uses']];
  let pos = 1;
  words.get().slice(0, 10).map(x => {
    // x[0] word, x[1] uses
    rows.push([pos++, x[0], x[1]]);
  });
  const commonWords = array2vdom(rows);

  const content = h('div', [
    h('p', `Stats generated on ${moment.utc().toISOString()}`),
    h('p', `In the last 31 days, a total of ${Object.keys(users).length}
      different nicks were represented on destiny.gg.`),
    topUsers(users),
    bigNumbers,
    commonWords
  ]);

  const html = fromString(`
    <!doctype html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="style.css">
    </head>
    <body>
    ${createElement(content).toString()}
    </body>
    </html>
  `);

  html.pipe(inline({ignoreImages: true})).pipe(process.stdout);
}

streamEach(db.createValueStream(), onData, render);
