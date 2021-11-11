require('dotenv').config()
const path = require('path');
var postScore = require('./post-score');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Edit score for Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({ args, channel, client, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const [username, score] = args;
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');
      retVal = await postScore.saveScore(username, score, currentWeek, client, interaction);
    }

    return retVal;
  },
}
