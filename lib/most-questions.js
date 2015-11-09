// Only consider users who have a message count of greater than this threshold.
// `pisg` default is the square-root of the message count of the top user, so
// we emulate that here with Caturday's message count of 13920.
const threshold = Math.sqrt(13920);

function mostQuestions(users) {
  var max = 0;
  var most = null;

  Object.keys(users).forEach(u => {
    const fraction = users[u].questions / users[u].lines;
    if (fraction > max && users[u].lines > threshold) {
      most = u;
      max = fraction;
    }
  });

  return [most, max];
}


module.exports = mostQuestions;
