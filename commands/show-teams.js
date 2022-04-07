require('dotenv').config()
const path = require('path');
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

    if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name);

      if (currentWeek.teams && currentWeek.teams.length > 0) {
        responseHelper.showTeams(currentWeek.scores, currentWeek.teams, interaction, true);
      } else {
        retVal = 'No teams were found.';
        interaction.reply({content: retVal, ephemeral: true});
      }
    }
  },
}