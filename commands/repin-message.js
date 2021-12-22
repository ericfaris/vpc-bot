require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Repin the competition corner message (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  callback: async ({ client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
    } else {
      const message = await channel.messages.fetch(process.env.COMPETITION_WEEKLY_POST_ID);
      message.unpin()
      message.pin();

      retVal = "Message has been re-pinned."
    }
    
    interaction.reply({content: retVal, ephemeral: true});
  },
}