const pairs = require('lodash.pairs');
const sortBy = require('lodash.sortby');

// Only consider users who have a message count of greater than this threshold.
// `pisg` default is the square-root of the message count of the top user, so
// we emulate that here with Caturday's message count of 13920.
const threshold = Math.sqrt(13920);

function mostQuestions(users) {
  const qs = sortBy(pairs(users).map((u) => {
    return [
      u[0],
      u[1].lines > threshold
        ? u[1].questions / u[1].lines
        : 0
    ];
  }), (u) => {
    // Negate for descending order
    return -u[1];
  });

  return [qs[0], qs[1]];
}


module.exports = mostQuestions;
