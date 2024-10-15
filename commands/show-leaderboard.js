require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show contest leaderboard for the channel.',
  channels: process.env.CONTEST_CHANNELS,
  callback: async ({ channel, interaction }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      module.exports.getLeaderboard(interaction, channel);
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },

  getLeaderboard : async (interaction, channel) => {
    const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
    await responseHelper.showLeaderboard(currentWeek.scores, currentWeek.teams, interaction, true);
  },
}