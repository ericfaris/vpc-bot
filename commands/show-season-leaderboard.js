require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const dbHelper = require('../helpers/dbHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Show season leaderboard for the Competition Corner',
  callback: async ({ channel, interaction, instance }) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const db = dbHelper.getArchiveDB();
      seasonWeeks = ["58", "59"];
      weeks = [];

      db.storage.forEach( function(week) {
        if( seasonWeeks.includes(week.details ? JSON.parse(week.details).week : '')) {
          weeks.push(week);
        }
      })

      responseHelper.showEphemeralSeasonLeaderboard(weeks, interaction)
      responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing season leaderboard...';
    }

    return retVal;
  },
}