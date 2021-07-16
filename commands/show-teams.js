require('dotenv').config()
const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: false,
  description: 'Show current teams for the Competition Corner',
  callback: async ({ interaction, channel, instance }) => {    
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The show-temas slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const db = new JSONdb('db.json');

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];
     
      if (teams) {
        responseHelper.showEphemeralTeams(scores, teams, interaction);

        retVal = 'showing score...';
      } else {
        retVal = 'No teams found.';
      }
    }

    return retVal;
  },
}