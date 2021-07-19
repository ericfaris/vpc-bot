require('dotenv').config()
var Table = require('easy-table')
var numeral = require('numeral');
const dbHelper = require('../helpers/dbHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  hidden: false,
  description: 'Show leaderboard for the Competition Corner',
  callback: async ({ channel, interaction, instance }) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The show-leaderboard slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const db = dbHelper.getCurrentDB();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      // sort descending
      scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

      responseHelper.showEphemeralLeaderboard(scores, teams, interaction)
      responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing leaderboard...';
    }

    return retVal;
  },
}