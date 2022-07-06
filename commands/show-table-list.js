require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');
const {VPCDataService} = require('../services/vpcDataService')

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Show high score table list.',
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  callback: async ({ channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    const vpcDataService = new VPCDataService();
    const permissionHelper2 = new PermissionHelper2();

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    interaction.reply({content: `For an up to date list of tables, please visit: \nhttps://virtualpinballchat.com/#/high-score-corner`, ephemeral: true});
  },
}