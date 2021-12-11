require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
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
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {

      const [currentTeamName, newTeamName] = args;

      // update or add teams
      await mongoHelper.findOneAndUpdate({ isArchived: false, 'teams.name': currentTeamName },
        {
          $set: { 'teams.$.name': newTeamName }
        }, null, 'weeks');

      // return text table string
      retVal = 'Team Name updated successfully.';
    }

    return retVal;
  },
}