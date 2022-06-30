require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');
const path = require('path');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: [process.env.CONTEST_CHANNELS],
  hidden: true,
  description: 'Creates new placeholder message authored by the bot.',
  callback: async ({ client, channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let permissionHelper2 = new PermissionHelper2();
    let retVal;

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      retVal = 'Placeholder message created successfully.';
      interaction.reply({content: retVal, ephemeral: false});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: ephemeral});
    }
  },
}
