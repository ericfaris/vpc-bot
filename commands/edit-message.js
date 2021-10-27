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
  description: 'Edit message for Competition Corner (VPC-ADMIN)',
  permissions: ['VPC-ADMIN'],
  roles: ['Competition Corner Mod'],
  minArgs: 4,
  expectedArgs: '<week> <periodstart> <periodend> <table> <tableurl> <romurl> <notes>',
  callback: async ({args, client, channel, interaction, instance}) => {
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

      const [week, periodstart, periodend, table, tableurl, romurl, notes] = args;

      var details = 
      {
        'week': week,
        'periodStart': periodstart,
        'periodEnd': periodend,
        'table': table,
        'tableUrl': tableurl,
        'romUrl': romurl,
        'notes': notes
      }

      //save scores to db
      db.set('details', JSON.stringify(details));

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      //post to competition channel pinned message
      await outputHelper.editWeeklyCompetitionCornerMessage(scores, client, details, teams);

      retVal =  process.env.COMPETITION_CHANNEL_NAME + ' message updated successfully.';
    }

    return retVal;
  },
}
