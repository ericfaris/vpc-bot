require('dotenv').config()
const path = require('path');
var postScore = require('./post-score');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit score for Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({ args, channel, client, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
    } else {
      const [username, score] = args;
      const currentWeek = await mongoHelper.findCurrentWeek('weeks');
      retVal = await postScore.saveScore(username, score, currentWeek, client, interaction);
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}
