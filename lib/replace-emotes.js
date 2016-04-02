const word = require('word-regex');
const h = require('virtual-dom/h');
const createElement = require('virtual-dom/create-element');
const emotes = require('destiny.gg-emotes');

function replaceEmotes(text) {
  const url = 'https://cdn.rawgit.com/destinygg/website/' +
    '214c87f8d335afe155d91065111b6a9365615312/scripts/emotes/emoticons/';

  function replacer(match) {
    const i = emotes.indexOf(match);
    return i !== -1
      ? createElement(h('img', {src: url + emotes[i] + '.png'})).toString()
      : match;
  }

  return text.replace(word(), replacer);
}

module.exports = replaceEmotes;
