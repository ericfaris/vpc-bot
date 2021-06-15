const JSONdb = require('simple-json-db');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Bot for resetting scores for Competition Corner',
  callback: ({interaction}) => {
    const db = new JSONdb('db.json');

    // clear scores
    db.delete('scores');

    return "Scores have been reset."
  },
}