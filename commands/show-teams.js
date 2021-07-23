require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const dbHelper = require('../helpers/dbHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Show current teams for the Competition Corner',
  callback: async ({ interaction, channel, instance }) => {    
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const db = dbHelper.getCurrentDB();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];
     
      if (teams && teams.length > 0) {
        responseHelper.showEphemeralTeams(scores, teams, interaction);
        responseHelper.deleteOriginalMessage(interaction, 0);

        retVal = 'showing teams...';
      } else {
        retVal = 'No teams were found.';
      }
    }

    return retVal;
  },
}