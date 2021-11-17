require('dotenv').config()
const path = require('path');
const Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show current teams for the Competition Corner',
  callback: async ({ interaction, channel, instance }) => {
    let retVal;

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');

      if (currentWeek.teams && currentWeek.teams.length > 0) {
        responseHelper.showEphemeralTeams(currentWeek.scores, currentWeek.teams, interaction);
        responseHelper.deleteOriginalMessage(interaction, 0);
        retVal = 'showing teams...';
      } else {
        retVal = 'No teams were found.';
      }
    }

    return retVal;
  },
}