require('dotenv').config()
const JSONdb = require('simple-json-db');
var postScore = require('./post-score');
const permissionHelper = require('../helpers/permissionHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Edit score for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({args, channel, client, interaction}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run edit-score.')
      return 'The edit-score slash command can only be executed by an admin.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The edit-score slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.';
    } else {
      const [username, score] = args;
      retVal = postScore.saveScore(username, score, client, interaction);
    }

    return retVal;
  },
}
