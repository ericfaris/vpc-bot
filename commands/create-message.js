require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  hidden: true,
  description: 'Create new message for Competition Corner (MANAGE_GUILD)',
  callback: async ({ client, channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      const message = `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`
      return message;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      try{
        const compChannel = await client.channels.fetch(234234);
        compChannel.send('This is your new message.');
        retVal = 'Message Created Successfully.';
        logger.info(retVal);
      } catch(error) {
        logger.error(error.message);
        throw error;
      }
    }

    return retVal;
  },
}
