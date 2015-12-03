const h = require('virtual-dom/h');
const isVNode = require('virtual-dom/vnode/is-vnode');

function array2vdom(rows) {
  const headings = rows[0].map(heading => {
    return h('th', heading);
  });

  // Remove the headings row.
  rows.shift();

  // Map twice! Once for each row and then again for each element.
  const body = rows.map(row => {
    return h('tr', row.map(td => {
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

module.exports = array2vdom;
