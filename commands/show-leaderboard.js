require('dotenv').config()
const path = require('path');
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
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');

      try{
        await responseHelper.showLeaderboard(currentWeek.scores, currentWeek.teams, interaction, true)
      } catch(e) {
        console.log(e);
      }
    }
  },
}