require('dotenv').config()
const path = require('path');
const date = require('date-and-time');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new playoff round',
  roles: ['Competition Corner Mod'],
  minArgs: 2,
  expectedArgs: '<roundName> <gameList>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    const [roundName, games] = args;
    let retVal;
    let ephemeral = false;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`);
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
      ephemeral = true;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      ephemeral = true;
    } else {
      const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');
      await mongoHelper.updateOne({ seasonNumber: parseInt(currentSeason.seasonNumber), isArchived: false }, { $set: { isArchived: true } }, null, 'rounds');

      let round = {
        'channelName' : channel.name,
        'seasonNumber' : parseInt(currentSeason.seasonNumber),
        'roundName' : roundName,
        'games' : games.split(',').map(x => parseInt(x)),
        'isArchived' : false
      }

      await mongoHelper.insertOne(round, 'rounds');

      return "Playoff Round created."
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
 