const JSONdb = require('simple-json-db');
var postScore = require('./post-score');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  permissions: ['ADMINISTRATOR'],
  description: 'Reset/clear scores and teams for Competition Corner.  This can be used to start a new week.',
  callback: async ({client, channel}) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The reset-scores slash command can only be used in the competition-corner channel.';
    } else {
      const db = new JSONdb('db.json');
      const archive = new JSONdb('archive.json');
      
      archive.storage.push(db.storage);
      archive.sync();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // clear scores
      db.delete('scores');
      // clear teams
      db.delete('teams');

      //post to competition channel pinned message
      await postScore.editChannel([], client);

      retVal = "Scores and Teams have been reset."
    }

    return retVal;
  },
}