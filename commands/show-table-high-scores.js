require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');
const { VPCDataService } = require('../services/vpcDataService')
const { ArgHelper } = require('../helpers/argHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Search table high scores.',
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  minArgs: 1,
  expectedArgs: '<tablesearchterm> <vpsid> <isephemeral>',
  callback: async ({ args, channel, interaction, instance, message, user }) => {
    let retVal;
    const logger = (new Logger(user)).logger;
    const vpcDataService = new VPCDataService();
    const permissionHelper = new PermissionHelper();
    const argHelper = new ArgHelper();

    try{
      const tableSearchTerm = argHelper.getArg(interaction.options.data, 'string', 'tablesearchterm');
      const vpsId = argHelper.getArg(interaction.options.data, 'string', 'vpsid');
      const isEphemeral = argHelper.getArg(interaction.options.data, 'bool', 'isephemeral');
      let tables = null;

      if(tableSearchTerm) {
        tables = await vpcDataService.getScoresByTableAndAuthorUsingFuzzyTableSearch(tableSearchTerm);
      }

      if(vpsId) {
        tables = await vpcDataService.getScoresByVpsId(vpsId);
      }
      
      interaction.channel = channel; 
      responseHelper.showHighScoreTables(tables, tableSearchTerm ?? vpsId, interaction, isEphemeral ?? true)
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}