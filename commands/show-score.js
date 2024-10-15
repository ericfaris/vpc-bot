require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show current score for user.',
  channels: process.env.CONTEST_CHANNELS,
  callback: async ({ interaction, channel, instance }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
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
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },
}