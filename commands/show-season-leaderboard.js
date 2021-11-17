require('dotenv').config()
const path = require('path');
const Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show season leaderboard for the Competition Corner',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  callback: async ({ channel, interaction, instance }) => {
    let retVal;

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const currentSeason = await mongoHelper.findOne({ isArchived: false }, 'seasons');
      const weeks = await mongoHelper.find({
        isArchived: true,
        periodStart: { $gte: currentSeason.seasonStart },
        periodEnd: { $lte: currentSeason.seasonEnd }
      }, 'weeks');

      responseHelper.showEphemeralSeasonLeaderboard(weeks, interaction)
      responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing season leaderboard...';
    }

    return retVal;
  },
}