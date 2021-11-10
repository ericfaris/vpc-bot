require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Show current score for the Competition Corner',
  callback: async ({ interaction, channel, instance }) => {    
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const username = interaction.member.user.username;

      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek(process.env.DB_NAME, 'weeks');

      const score = currentWeek.scores ? currentWeek.scores.find(x => x.username === username) : null;
      
      if (score) {
        var t = new Table;
        score.rank = currentWeek.scores.findIndex(x => x.username === username) + 1;
        const numOfScores = currentWeek.scores.length;

        responseHelper.showEphemeralScore(score, numOfScores, t, interaction);
        responseHelper.deleteOriginalMessage(interaction, 0);

        retVal = 'showing score...';
      } else {
        responseHelper.deleteOriginalMessage(interaction, instance.del);
        retVal = `No score found for ${username}. This message will be deleted in ${instance.del} seconds.`;
      }
    }

    return retVal;
  },
}