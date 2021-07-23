const DiscordJS = require('discord.js')
const https =  require('https');
require('dotenv').config()
const fetch = require('node-fetch');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  permissions: ['ADMINISTRATOR'],
  description: 'Create message for Competition Corner (ADMINISTRATOR)',
  callback: async ({client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run create-message.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The create-message slash command can only be executed by an admin.  '
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The create-message slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      compChannel.send('new message');

      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
