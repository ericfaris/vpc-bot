require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const {VPCDataService} = require('../services/vpcDataService')

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Search table high scores',
  minArgs: 1,
  expectedArgs: '<tablesearchterm>',
  callback: async ({ args, channel, interaction, instance, message, user }) => {
    let retVal;
    let logger = (new Logger(user)).logger;
    let vpcDataService = new VPCDataService();
    const [tableSearchTerm, isEphemeral] = args;

    logger.info('Checking if in Hign Score Channel');
    logger.info(`channelName: ${channel?.name ?? message?.channel?.name}`);
    if ((channel?.name ?? message?.channel?.name) !== process.env.HIGH_SCORES_CHANNEL_NAME) {
      logger.info('Not in High Score Channel');
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      try{
        logger.info('Getting data from VPC Data Service.');
        const tables = await vpcDataService.getScoresByTableAndAuthorUsingFuzzyTableSearch(tableSearchTerm);
        logger.info('Fetched data from VPC Data Service.');
        logger.info(`tables: ${tables}`);
        interaction.channel = channel;
    
        responseHelper.showHighScoreTables(tables, tableSearchTerm, interaction, isEphemeral ?? true)
      } catch(e) {
        console.log(e);
      }
    }
  },
}