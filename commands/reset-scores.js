require('dotenv').config()
const path = require('path');
const dbHelper = require('../helpers/dbHelper');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Reset/clear scores and teams for Competition Corner, Archives current week data (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  roles: ['Competition Corner Mod'],
  callback: async ({client, channel, interaction, instance}) => {
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
      const archive = dbHelper.getArchiveDB();
      const season = dbHelper.getSeasonDB();
      
      archive.storage.push(db.storage);
      archive.sync();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get details from db
      const details = db.get('details') ? JSON.parse(db.get('details')) : null;

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      const seasonWeeks = season.get('weeks');

      // clear scores
      db.delete('scores');
      // clear teams
      db.delete('teams');

      //post to competition channel pinned message
      await outputHelper.editWeeklyCompetitionCornerMessage([], client, details, teams);

      //update season competition corner message
      weeks = [];
      archive.storage.forEach( function(week) {
        if( seasonWeeks.includes(week.details ? parseInt(JSON.parse(week.details).week) : '')) {
          weeks.push(week);
        }
      })
      await outputHelper.editSeasonCompetitionCornerMessage(season, weeks, client);

      retVal = "Scores and Teams have been reset. Season Leaderboard has been updated."
    }

    return retVal;
  },
}