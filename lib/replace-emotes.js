const word = require('word-regex');
const h = require('virtual-dom/h');
const createElement = require('virtual-dom/create-element');
const emotes = require('destiny.gg-emotes');

function replaceEmotes(text) {
  const url = 'https://cdn.rawgit.com/destinygg/website/' +
    '78673af5bc3c404d6ce7ba5c20980f8f27deaf91/scripts/emotes/emoticons/';

  function replacer(match) {
    const i = emotes.indexOf(match);
    return i !== -1
      ? createElement(h('img', {src: url + emotes[i] + '.png'})).toString()
      : match;
  }

  return text.replace(word(), replacer);
}

module.exports = replaceEmotes;
