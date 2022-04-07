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
  description: 'Show current score for user',
  callback: async ({ interaction, channel, instance }) => {
    let retVal;

    if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const username = interaction.member.user.username;
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
      const score = currentWeek.scores ? currentWeek.scores.find(x => x.username === username) : null;

      if (score) {
        var t = new Table;
        score.rank = currentWeek.scores.findIndex(x => x.username === username) + 1;
        const numOfScores = currentWeek.scores.length;
        responseHelper.showScore(score, numOfScores, t, interaction, true);
      } else {
        retVal = `No score found for ${username}.`;
        interaction.reply({content: retVal, ephemeral: true});
      }
    }
  },
}