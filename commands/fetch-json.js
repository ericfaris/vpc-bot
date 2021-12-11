require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  description: 'Fetch JSON files (MANAGE_GUILD)',
  callback: async ({client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      responseHelper.postJsonDataFiles(client);      
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
