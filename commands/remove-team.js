require('dotenv').config()
const JSONdb = require('simple-json-db');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: true,
  // testOnly: false,
  guildOnly: true,
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

      const db = new JSONdb('db.json');
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
      retVal =  'Team removed successfully. \n\n' + t.toString();
    }

    return retVal;
  },
}