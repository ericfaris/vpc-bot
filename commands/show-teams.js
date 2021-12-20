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
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');

      if (currentWeek.teams && currentWeek.teams.length > 0) {
        responseHelper.showEphemeralTeams(currentWeek.scores, currentWeek.teams, interaction);
      } else {
        retVal = 'No teams were found.';
        interaction.reply({content: retVal, ephemeral: true});
      }
    }
  },
}