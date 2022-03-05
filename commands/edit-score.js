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
  callback: async ({ args, channel, client, interaction, message, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
    } else {
      const [username, score] = args;
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name, 'weeks');
      retVal = await postScore.saveScore(username, score, currentWeek, client, interaction, message, channel);
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}
