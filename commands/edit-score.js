require('dotenv').config()
var postScore = require('./post-score');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Edit score for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({args, channel, client, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run edit-score.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The edit-score slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The edit-score slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const [username, score] = args;
      retVal = postScore.saveScore(username, score, client, interaction);
    }

    return retVal;
  },
}
