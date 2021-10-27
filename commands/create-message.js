require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  permissions: ['VPC-ADMIN'],
  roles: ['Competition Corner Mod'],
  description: 'Create message for Competition Corner (VPC-ADMIN)',
  callback: async ({client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      compChannel.send('new message');

      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
