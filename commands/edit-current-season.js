require('dotenv').config()
const path = require('path');
const dot = require('mongo-dot-notation')
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');
const { ArgHelper } = require('../helpers/argHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit the current season.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  minArgs: 1,
  expectedArgs: '<seasonnumber> <seasonname> <seasonstart> <seasonend>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();
    const argHelper = new ArgHelper();

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}
    
    try {
      const seasonNumber = argHelper.getArg(interaction.options.data, 'string', 'seasonnumber');
      const seasonName = argHelper.getArg(interaction.options.data, 'string', 'seasonname');
      const seasonStart = argHelper.getArg(interaction.options.data, 'string', 'seasonstart');
      const seasonEnd = argHelper.getArg(interaction.options.data, 'string', 'seasonend');
      const updatedSeason = {};
      
      seasonNumber ? updatedSeason.seasonNumber = seasonNumber : null;
      seasonName ? updatedSeason.seasonName = seasonName : null;
      seasonStart ? updatedSeason.seasonStart = seasonStart : null;
      seasonEnd ? updatedSeason.seasonEnd = seasonEnd : null;

      const set = dot.flatten(updatedSeason);
      const updatedDoc = await mongoHelper.findOneAndUpdate({ isArchived: false },
        set,
        { returnDocument: 'after' },
        'seasons');

      const weeks = await mongoHelper.find({
        channelName: channel.name,
        isArchived: true,
        periodStart: { $gte: updatedDoc.value.seasonStart },
        periodEnd: { $lte: updatedDoc.value.seasonEnd }
      }, 'weeks');

      await outputHelper.editSeasonCompetitionCornerMessage(updatedDoc.value, weeks, client);

      retVal = "Season has been updated."
      interaction.reply({content: retVal, ephemeral: true});
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },
}