require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show leaderboard for the channel.',
  callback: async ({ channel, interaction, instance }) => {
    let retVal;

    if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name);

      try{
        await responseHelper.showLeaderboard(currentWeek.scores, currentWeek.teams, interaction, true)
      } catch(e) {
        console.log(e);
      }
    }
  },
}