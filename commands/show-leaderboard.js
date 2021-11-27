require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show leaderboard for the Competition Corner',
  callback: async ({ channel, interaction, instance }) => {
    let retVal;

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');

      responseHelper.showEphemeralLeaderboard(currentWeek.scores, currentWeek.teams, interaction)
      responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing leaderboard...';
    }

    return retVal;
  },
}