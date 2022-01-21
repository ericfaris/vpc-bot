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
  description: 'Show high score table list',
  callback: async ({ channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    let vpcDataService = new VPCDataService();

      if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
        retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`;
        interaction.reply({content: retVal, ephemeral: true});
      } else { 
        try {
          const tables = await vpcDataService.getTablesWithAuthorVersion();
          responseHelper.showHighScoreTables(tables, null, interaction, true)
        } catch (e) {
          console.log(e);
          logger.error(e);
        }
      }
  },
}