require('dotenv').config()
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: true,
  // testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Repin the competition corner message (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  callback: async ({client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run reset-scores.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The repin-message slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The repin-message slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const message = await channel.messages.fetch(process.env.COMPETITION_POST_ID);
      message.unpin()
      message.pin();

      retVal = "Message has been re-pinned."
    }

    return retVal;
  },
}