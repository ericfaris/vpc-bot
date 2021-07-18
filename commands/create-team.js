require('dotenv').config()
const JSONdb = require('simple-json-db');
var Table = require('easy-table')
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Create teams for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<team>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run create-team.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The create-team slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The create-team slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {

      const db = new JSONdb('/data/db.json');
      const t = new Table;
      const [team] = args;

      const teamName = team.substring(0, team.indexOf(":"));
      const members = team.substring(team.indexOf(":")+1).split(",");

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      //search for existing team
      const existingTeam = teams.find(x => x.teamName === teamName);

      // update or add teams
      if (existingTeam) {
        existingTeam.members = members;
      } else {
        teams.push({'teamName': teamName, 'members': members});
      }

      //save teams to db
      db.set('teams', JSON.stringify(teams));

      // create text table
      var i = 0;
      members.forEach(function(member) {
        t.cell(teamName, member)
        t.newRow()
      })
      
      // return text table string
      retVal =  'Team created successfully. \n\n' + t.toString();
    }

    return retVal;
  },
}