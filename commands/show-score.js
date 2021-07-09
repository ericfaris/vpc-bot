require('dotenv').config()
const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: false,
  description: 'Show current score for the Competition Corner',
  callback: async ({ interaction, channel }) => {    
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The show-score slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.';
    } else {
      const db = new JSONdb('db.json');
      const username = interaction.member.user.username;

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // sort descending
      scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

      const score = scores.find(x => x.username === username);
      
      if (score) {
        var t = new Table;
        score.rank = scores.findIndex(x => x.username === username) + 1;
        const numOfScores = scores.length;

        responseHelper.showEphemeralScore(score, numOfScores, t, interaction);

        retVal = 'showing score...';
      } else {
        retVal = 'No score found for ' + username;
      }
    }

    return retVal;
  },
}