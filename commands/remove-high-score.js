require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Remove high score by rank from a high score table (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['High Score Corner Mod'],
  minArgs: 1,
  expectedArgs: '<vpsid> <rank>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
    } else {
      const [vpsId, rank] = args;

      //get current week
      const currentWeek = await mongoHelper.aggregate();

      //remove score based on rank/index
      var retArray = currentWeek.scores.splice(rank - 1, 1);

      //save scores to db
      await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { scores: currentWeek.scores } }, null, 'weeks');

      if (retArray.length > 0) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Rank of ' + rank + ' not found.';
      }
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}