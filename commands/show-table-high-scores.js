require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');
const {VPCDataService} = require('../services/vpcDataService')

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Search table high scores.',
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  minArgs: 1,
  expectedArgs: '<tablesearchterm>',
  callback: async ({ args, channel, interaction, instance, message, user }) => {
    let retVal;
    const logger = (new Logger(user)).logger;
    const vpcDataService = new VPCDataService();
    const permissionHelper = new PermissionHelper();
    const [tableSearchTerm, isEphemeral] = args;

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const tables = await vpcDataService.getScoresByTableAndAuthorUsingFuzzyTableSearch(tableSearchTerm);
      interaction.channel = channel; 
      responseHelper.showHighScoreTables(tables, tableSearchTerm, interaction, isEphemeral ?? true)
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}