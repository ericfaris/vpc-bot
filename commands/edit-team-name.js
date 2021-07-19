require('dotenv').config()
const dbHelper = require('../helpers/dbHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  hidden: true,
  description: 'Edit team name for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  expectedArgs: '<current-team-name> <new-team-name>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run edit-team-name.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The edit-team-name slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The edit-team-name slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
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