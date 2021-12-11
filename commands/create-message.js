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
  roles: ['Competition Corner Mod'],
  hidden: true,
  description: 'Create new message for Competition Corner (MANAGE_GUILD)',
  callback: async ({ client, channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      const message = `${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`
      return message;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      try{
        const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
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
