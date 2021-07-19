require('dotenv').config()
const dbHelper = require('../helpers/dbHelper');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  hidden: true,
  description: 'Reset/clear scores and teams for Competition Corner, Archives current week data (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  callback: async ({client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run reset-scores.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The reset-scores slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The reset-scores slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const db = dbHelper.getCurrentDB();
      const archive = dbHelper.getArchiveDB();
      
      archive.storage.push(db.storage);
      archive.sync();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get details from db
      const details = db.get('details') ? JSON.parse(db.get('details')) : null;

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      // clear scores
      db.delete('scores');
      // clear teams
      db.delete('teams');

      //post to competition channel pinned message
      await outputHelper.editCompetitionCornerMessage([], client, details, teams);

      retVal = "Scores and Teams have been reset."
    }

    return retVal;
  },
}