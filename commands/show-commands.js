require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');
const path = require('path');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  hidden: true,
  description: 'Shows all available commands.',
  callback: async ({ client, channel, interaction, instance, user }) => {
    let result;
    let logger = (new Logger(user)).logger;
    let permissionHelper = new PermissionHelper();

    result = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (result) {interaction.reply({content: result, ephemeral: true}); return;}

    try{
      result = '';
      const guildOnly = await instance.slashCommands.get(channel.guild.id);
      guildOnly.forEach(element => {
        result += `${element.name}: ${element.id}\n`;
      });

      interaction.reply({content: result, ephemeral: false});
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },
}
