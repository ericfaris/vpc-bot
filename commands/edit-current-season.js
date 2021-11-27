require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit current season details and re-post the season leaderboard pinned message (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 4,
  expectedArgs: '<seasonnumber> <seasonname> <seasonstart> <seasonend>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      const [seasonnumber, seasonname, seasonstart, seasonend] = args;

      const updatedSeason = {
        'seasonNumber': seasonnumber,
        'seasonName': seasonname,
        'seasonStart': seasonstart,
        'seasonEnd': seasonend,
      }

      await mongoHelper.findOneAndUpdate({ isArchived: false }, {
        $set: updatedSeason
      },
        null,
        'seasons');

      const weeks = await mongoHelper.find({
        isArchived: true,
        periodStart: { $gte: updatedSeason.seasonStart },
        periodEnd: { $lte: updatedSeason.seasonEnd }
      }, 'weeks');

      await outputHelper.editSeasonCompetitionCornerMessage(updatedSeason, weeks, client);

      retVal = "Season has been updated."
    }

    return retVal;
  },
}