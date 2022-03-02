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
  description: 'Remove team from Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 1,
  expectedArgs: '<team>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      retVal =  `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
    } else {
      const [teamName] = args;

      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name, 'weeks');

      const index = currentWeek.teams.findIndex(x => x.name === teamName);

      if (index > -1) {
        currentWeek.teams.splice(index, 1);
      }

      //save teams to db
      await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { teams: currentWeek.teams } }, null, 'weeks');

      // return text table string
      retVal = 'Team removed successfully.';
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}