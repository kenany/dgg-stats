'use strict';

const matchWords = require('match-words');
const pairs = require('lodash.pairs');
const sortBy = require('lodash.sortby');
const emotes = require('destiny.gg-emotes');
const commonWords = require('common-words');

function CommonWords() {
  if (!(this instanceof CommonWords)) {
    return new CommonWords();
  }

  this.words = {};
}

CommonWords.prototype.add = function add(msg) {
  const self = this;
  const matched = matchWords(msg);

  if (!matched) {
    return;
  }

  matched.forEach((word) => {
    // Ignore most common English words (otherwise "the" becomes the most used
    // which is not very interesting) and emotes. This still needs to be
    // improved further because now "is" is the most common word.
    let common = false;
    commonWords.forEach((obj) => {
      if (!common && word === obj.word) {
        common = true;
      }
    });
    if (common || emotes.indexOf(word) !== -1) {
      return;
    }

    if (!self.words[word]) {
      self.words[word] = 0;
    }

    self.words[word]++;
  });
};

CommonWords.prototype.get = function get() {
  return sortBy(pairs(this.words), (u) => {
    // Negate for descending order
    return -u[1];
  });
};

module.exports = CommonWords;
