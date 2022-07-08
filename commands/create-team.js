require('dotenv').config()
const path = require('path');
const Table = require('easy-table')
const { PermissionHelper } = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create teams for contest.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 1,
  expectedArgs: '<team>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let permissionHelper = new PermissionHelper();
    let retVal;

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{

      const t = new Table;
      const [team] = args || {};

      const teamName = team.substring(0, team.indexOf(":"));
      const members = team.substring(team.indexOf(":") + 1).split(",");

      const existingTeam = await mongoHelper.findOne({ channelName: channel.name, isArchived: false, 'teams.name': teamName }, 'weeks');

      // update or add teams
      if (existingTeam) {
        existingTeam.members = team.members;
        await mongoHelper.updateOne({ channelName: channel.name, isArchived: false, 'teams.name': teamName }, { $push: { 'teams': existingTeam } }, null, 'weeks');
      } else {
        const newTeam = new Object();
        newTeam.name = teamName;
        newTeam.members = members;
        await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $push: { 'teams': newTeam } }, null, 'weeks');
      }

      // create text table
      var i = 0;
      members.forEach(function (member) {
        t.cell(teamName, member)
        t.newRow()
      })

      // return text table string
      retVal = 'Team created successfully. \n\n' + t.toString();
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }

  },
}