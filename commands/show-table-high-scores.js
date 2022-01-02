require('dotenv').config()
const path = require('path');
const { SearchPipelineHelper } = require('../helpers/pipelineHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

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
    const [tableSearchTerm] = args;
    let pipeline = (new SearchPipelineHelper(tableSearchTerm)).pipeline;

    if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      try{
        const tables = await mongoHelper.aggregate(pipeline, 'tables');
        responseHelper.showEphemeralHighScoreTables(tables, tableSearchTerm, interaction)
      } catch(e) {
        console.log(e);
      }
    }
  },
}