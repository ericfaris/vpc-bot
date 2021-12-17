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

    try {
      if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
        responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
        retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`
          + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
      } else {
        
        const tables = await mongoHelper.aggregate(pipeline, 'tables');

        responseHelper.showEphemeralHighScoreTables(tables, null, interaction)
        responseHelper.deleteOriginalMessage(interaction, 0);

        retVal = 'Fetching tables...';
      }

      return retVal;
    } catch (e) {
      console.log(e);
      logger.error(e);
    }
  },
}