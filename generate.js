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

const topUsers = require('./lib/top-users');
const mostQuestions = require('./lib/most-questions');

const db = level(path.resolve(__dirname, 'db'), {valueEncoding: 'json'});

const users = {};

db.createValueStream()
  .on('data', data => {
    if (!users[data.user]) {
      users[data.user] = {
        lines: 0,
        avgWords: 0,
        quotes: [],
        latest: moment.utc(data.timestamp),
        questions: 0
      };
    }

    users[data.user].lines++;

    // Cumulative moving average of the number of words in this user's messages.
    var avg = users[data.user].avgWords;
    avg += (wordcount(data.message) - avg) / users[data.user].lines;
    users[data.user].avgWords = avg;

    users[data.user].quotes.push(data.message);

    if (moment.utc(data.timestamp).isAfter(users[data.user].latest)) {
      users[data.user].latest = moment.utc(data.timestamp);
    }

    if (data.message.indexOf('?') !== -1) {
      users[data.user].questions++;
    }
  })
  .on('end', render);

function render() {
  // bigAsk[0] is the username, bigAsk[1] is the fraction of lines that
  // contained a question.
  const bigAsk = mostQuestions(users);

  const bigNumbers = h('table', [
    h('thead', [
      h('tr', [
        h('th', 'big numbers')
      ])
    ]),
    h('tbody', [
      h('tr', [
        h('td', `Why does ${bigAsk[0]} ask so many questions?
          ${roundTo(100 * bigAsk[1], 1)}% of their lines contained a question!`)
      ])
    ])
  ]);

  const content = h('div', [
    h('p', 'Stats generated on ' + moment.utc().toISOString()),
    h('p', 'In the last 31 days, a total of ' + Object.keys(users).length
      + ' different nicks were represented on destiny.gg.'),
    topUsers(users),
    bigNumbers
  ]);

  const html = fromString([
    '<!doctype html>',
    '<head>',
    '  <meta charset="utf-8">',
    '  <link rel="stylesheet" type="text/css" href="style.css">',
    '</head>',
    '<body>',
    createElement(content).toString(),
    '</body>',
    '</html>'
  ].join(''));

  html.pipe(inline({ignoreImages: true})).pipe(process.stdout);
}
