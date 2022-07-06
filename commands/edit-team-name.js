require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit team name for current contest.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 2,
  expectedArgs: '<current-team-name> <new-team-name>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;
    const permissionHelper2 = new PermissionHelper2();

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const [currentTeamName, newTeamName] = args;

      // update or add teams
      await mongoHelper.findOneAndUpdate({ channelName: channel.name, isArchived: false, 'teams.name': currentTeamName },
        {
          $set: { 'teams.$.name': newTeamName }
        }, null, 'weeks');

      // return text table string
      retVal = 'Team Name updated successfully.';
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}