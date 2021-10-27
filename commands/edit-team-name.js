require('dotenv').config()
const path = require('path');
const dbHelper = require('../helpers/dbHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Edit team name for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  roles: ['Competition Corner Mod'],
  minArgs: 2,
  expectedArgs: '<current-team-name> <new-team-name>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {

      const db = dbHelper.getCurrentDB();
      const [currentTeamName, newTeamName] = args;

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      //search for existing team
      const existingTeam = teams.find(x => x.teamName === currentTeamName);

      // update or add teams
      if (existingTeam) {
        existingTeam.teamName = newTeamName
      }

      //save teams to db
      db.set('teams', JSON.stringify(teams));
     
      // return text table string
      retVal = 'Team Name updated successfully.';
    }

    return retVal;
  },
}