require('dotenv').config()
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
  callback: async ({ args, channel, interaction, instance }) => {
    let retVal;
    let vpcDataService = new VPCDataService();
    const [tableSearchTerm, isEphemeral] = args;

    if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      try{
        const tables = await vpcDataService.getScoresByTableAndAuthorUsingFuzzyTableSearch(tableSearchTerm);
        interaction.channel = channel;
        responseHelper.showHighScoreTables(tables, tableSearchTerm, interaction, isEphemeral ?? true)
      } catch(e) {
        console.log(e);
      }
    }
  },
}