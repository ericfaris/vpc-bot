const DiscordJS = require('discord.js')
const https =  require('https');
require('dotenv').config()
const fetch = require('node-fetch');
const permissionHelper = require('../helpers/permissionHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  permissions: ['ADMINISTRATOR'],
  description: 'Create message for Competition Corner (ADMINISTRATOR)',
  callback: async ({client, channel, interaction}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run create-message.')
      return 'The create-message slash command can only be executed by an admin.';
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The create-message slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.';
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      compChannel.send('new message');

      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
