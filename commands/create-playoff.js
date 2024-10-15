require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');
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
    let permissionHelper = new PermissionHelper();
    let retVal;
    let ephemeral = false;

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try {
      const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');

      leaderboard = (await module.exports.getCurrentSeasonLeaderboard(channel)).slice(0,16);

      let playoff = {
        'channelName' : channel.name,
        'seasonNumber' : parseInt(currentSeason.seasonNumber),
        'seeds' : leaderboard,
        'isArchived' : false
      }

      await mongoHelper.insertOne(playoff, 'playoffs');

      const round = {
        'channelName': channel.name,
        'seasonNumber': parseInt(currentSeason.seasonNumber),
        'roundName': '1st Round',
        'games': [
          16,
          1,
          9,
          8,
          12,
          5,
          13,
          4,
          14,
          3,
          11,
          6,
          10,
          7,
          15,
          2
        ],
        'isArchived': false
      }

      await mongoHelper.insertOne(round, 'rounds');

      return 'Playoff created.'
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: ephemeral});
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
 