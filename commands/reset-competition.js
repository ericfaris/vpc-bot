const JSONdb = require('simple-json-db');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Reset/clear scores and teams for Competition Corner.  This can be used to start a new week.',
  callback: ({interaction}) => {
    const db = new JSONdb('db.json');

    // clear scores
    db.delete('scores');
    // clear teams
    db.delete('teams');

    return "Scores and Teams have been reset."
  },
}