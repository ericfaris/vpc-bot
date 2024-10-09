require('dotenv').config()
const path = require('path');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Show high score table list.',
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  callback: async ({ channel, interaction, instance, user }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    interaction.reply({content: `For an up to date list of tables, please visit: \nhttps://virtualpinballchat.com/#/high-score-corner`, ephemeral: true});
  },
}