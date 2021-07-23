require('dotenv').config()
const dbHelper = require('../helpers/dbHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  hidden: true,
  description: 'Remove score by rank from Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<rank>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run remove-team.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The remove-score slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The remove-score slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      let rank = args[0];
      const db = dbHelper.getCurrentDB();


      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      //remove score based on rank/index
      var retArray = scores.splice(rank-1, 1);

      if(retArray.length > 0) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Rank of ' + rank + ' not found.';
      }

      //save scores to db
      db.set('scores', JSON.stringify(scores));
    }

    return retVal;
  },
}