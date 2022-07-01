require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Creates new playoff from current season leaderboard.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  callback: async ({ args, client, channel, interaction, instance }) => {
    let permissionHelper2 = new PermissionHelper2();
    let retVal;
    let ephemeral = false;

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try {
      const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');

      leaderboard = (await module.exports.getCurrentSeasonLeaderboard(channel)).slice(0,16);

      let playoff = {
        'channelName' : channel.name,
        'seasonNumber' : parseInt(currentSeason.seasonNumber),
        'seeds' : leaderboard
      }

      await mongoHelper.insertOne(playoff, 'playoffs');

      return "Playoff created."
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: ephemeral});
    }
  },

  getCurrentSeasonLeaderboard : async (channel) => {
    const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');
    const weeks = await mongoHelper.find({
      channelName: channel.name,
      isArchived: true,
      periodStart: { $gte: currentSeason.seasonStart },
      periodEnd: { $lte: currentSeason.seasonEnd }
    }, 'weeks');

    return outputHelper.getSeasonLeaderboard(weeks);
  }
}
 