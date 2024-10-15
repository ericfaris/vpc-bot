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
  description: 'Creates new season.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  minArgs: 4,
  expectedArgs: '<seasonnumber> <seasonname> <seasonstart> <seasonend>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let permissionHelper = new PermissionHelper();
    let retVal;

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}
    
    try {
      const [seasonnumber, seasonname, seasonstart, seasonend] = args;

      var season = {
        'seasonNumber': seasonnumber,
        'seasonName': seasonname,
        'seasonStart': seasonstart,
        'seasonEnd': seasonend,
        'isArchived': false
      }

      await mongoHelper.updateOne({ isArchived: false }, { $set: { isArchived: true } }, null, 'seasons');

      await mongoHelper.insertOne(season, 'seasons');

      const weeks = await mongoHelper.find({
        channelName: channel.name,
        isArchived: true,
        periodStart: { $gte: season.seasonStart },
        periodEnd: { $lte: season.seasonEnd }
      }, 'weeks');

      await outputHelper.editSeasonCompetitionCornerMessage(season, weeks, client);

      retVal = `New season created and the ${process.env.COMPETITION_CHANNEL_NAME} message was updated successfully.`;
      interaction.reply({content: retVal, ephemeral: true});
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },
}
