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
  description: 'Edit team name for Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 2,
  expectedArgs: '<current-team-name> <new-team-name>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`
    } else {
      const [currentTeamName, newTeamName] = args;

      // update or add teams
      await mongoHelper.findOneAndUpdate({ channelName: channel.name, isArchived: false, 'teams.name': currentTeamName },
        {
          $set: { 'teams.$.name': newTeamName }
        }, null, 'weeks');

      // return text table string
      retVal = 'Team Name updated successfully.';
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}