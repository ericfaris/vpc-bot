require('dotenv').config()
const JSONdb = require('simple-json-db');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Edit message for Competition Corner (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  minArgs: 3,
  expectedArgs: '<week> <period> <table> <link>',
  callback: async ({args, client, channel, interaction, instance}) => {
    let retVal;
    
    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run edit-message.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The edit-message slash command can only be executed by an admin.'
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The edit-message slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const db = new JSONdb('/data/db.json');
      const [week, period, table, link] = args;

      var details = 
      {
        'week': week,
        'period': period,
        'table': table,
        'link': link 
      }

      //save scores to db
      db.set('details', JSON.stringify(details));

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      //post to competition channel pinned message
      await outputHelper.editCompetitionCornerMessage(scores, client, details, teams);

      retVal =  process.env.COMPETITION_CHANNEL_NAME + ' message updated successfully.';
    }

    return retVal;
  },
}
