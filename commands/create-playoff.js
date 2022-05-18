require('dotenv').config()
const path = require('path');
const date = require('date-and-time');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { CommandHelper } = require('../helpers/commandHelper');
const { VPCDataService } = require('../services/vpcDataService')
const { VPSDataService } = require('../services/vpsDataService');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new playoff using Season # and comma seperated list of Seed#:Username',
  roles: ['Competition Corner Mod'],
  // minArgs: 1,
  // expectedArgs: '<seasonnumber> <seedanduserlist>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    let ephemeral = false;
    let commandHelper = new CommandHelper();
    let vpcDataService = new VPCDataService();
    let vpsDataService = new VPSDataService();

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`);
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
      ephemeral = true;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      ephemeral = true;
    } else {
      const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');

      leaderboard = (await module.exports.getCurrentSeasonLeaderboard(channel)).slice(0,16);

      let playoff = {
        'channelName' : channel.name,
        'seasonNumber' : parseInt(currentSeason.seasonNumber),
        'seeds' : leaderboard
      }

      await mongoHelper.insertOne(playoff, 'playoffs');

      return "Playoff created."
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
 