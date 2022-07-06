require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show contest leaderboard for the channel.',
  channels: process.env.CONTEST_CHANNELS,
  callback: async ({ channel, interaction }) => {
    let retVal;
    const permissionHelper2 = new PermissionHelper2();

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      module.exports.getLeaderboard(interaction, channel);
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

  getLeaderboard : async (interaction, channel) => {
    const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
    await responseHelper.showLeaderboard(currentWeek.scores, currentWeek.teams, interaction, true);
  },
}