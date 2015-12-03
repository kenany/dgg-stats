const roundTo = require('round-to');
const pairs = require('lodash.pairs');
const sortBy = require('lodash.sortby');
const pick = require('alea-deck').pick;
const h = require('virtual-dom/h');
const isVNode = require('virtual-dom/vnode/is-vnode');
const convertHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});

const replaceEmotes = require('./replace-emotes');
const array2vdom = require('./array-to-vdom-table');

function topUsers(users) {
  const rows = [
    ['#', 'nick', 'lines', 'words per line', 'last seen', 'random quote']
  ];

  sortBy(pairs(users), x => {
    return -x[1].lines;
  }).forEach((x, i) => {
    if (i > 24) {
      return;
    }

    rows.push([
      i + 1,
      x[0],
      x[1].lines,
      roundTo(x[1].avgWords, 1),
      x[1].latest.fromNow(),
      convertHTML('<span>"' + replaceEmotes(pick(x[1].quotes)) + '"</span>')
    ]);
  });

  return array2vdom(rows);
}

module.exports = topUsers;
