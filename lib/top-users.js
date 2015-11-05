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

  const headings = rows[0].map(function(heading) {
    return h('th', heading);
  });

  // Remove the headings row.
  rows.shift();

  // Map twice! Once for each row and then again for each element.
  const body = rows.map(function(row) {
    return h('tr', row.map(function(td) {
      // Random quotes are VNodes instead of Strings in order to allow images.
      return h('td', isVNode(td) ? [td] : String(td));
    }));
  });

  return h('table', [
    h('thead', [
      h('tr', headings)
    ]),
    h('tbody', body)
  ]);
}

module.exports = topUsers;
