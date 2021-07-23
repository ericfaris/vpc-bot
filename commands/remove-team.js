require('dotenv').config()
const dbHelper = require('../helpers/dbHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  hidden: true,
  description: 'Remove team from Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<team>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run remove-team.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The remove-team slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The remove-team slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const db = dbHelper.getCurrentDB();
      const [teamName] = args;

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      const index = teams.findIndex(x => x.teamName === teamName);
      if (index > -1) {
        teams.splice(index, 1);
      }

      //save teams to db
      db.set('teams', JSON.stringify(teams));
     
      // return text table string
      retVal =  'Team removed successfully.';
    }

    return retVal;
  },
}