const JSONdb = require('simple-json-db');
var postScore = require('./post-score');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Reset/clear scores and teams for Competition Corner.  This can be used to start a new week.',
  callback: async ({client}) => {
    const db = new JSONdb('db.json');
    
    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    // clear scores
    db.delete('scores');
    // clear teams
    db.delete('teams');

    //post to competition channel pinned message
    await postScore.editChannel(scores, client);

    return "Scores and Teams have been reset."
  },
}