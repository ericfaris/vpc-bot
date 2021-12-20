require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { AllPipelineHelper } = require('../helpers/pipelineHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Show high score tables list',
  callback: async ({ channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    let pipeline = (new AllPipelineHelper()).pipeline;

      if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
        retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`;
        interaction.reply({content: retVal, ephemeral: true});
      } else { 
        try {
          const tables = await mongoHelper.aggregate(pipeline, 'tables');
          responseHelper.showEphemeralHighScoreTables(tables, null, interaction)
        } catch (e) {
          console.log(e);
          logger.error(e);
        }
      }
  },
}