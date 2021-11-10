require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Edit Current Week Details for Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 4,
  expectedArgs: '<weeknumber> <periodstart> <periodend> <table> <tableurl> <romurl> <currentseasonweeknumber> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {

      const [weeknumber, periodstart, periodend, table, tableurl, romurl, currentseasonweeknumber, notes] = args;

      const week = await mongoHelper.findOneAndUpdate({ isArchived: false }, {
        $set: {
          'weekNumber': weeknumber,
          'periodStart': periodstart,
          'periodEnd': periodend,
          'table': table,
          'tableUrl': tableurl,
          'romUrl': romurl,
          'currentSeasonWeekNumber': currentseasonweeknumber,
          'notes': notes
        }
      },
        { returnNewDocument: true },
        process.env.DB_NAME, 'weeks');

      //post to competition channel pinned message
      await outputHelper.editWeeklyCompetitionCornerMessage(week.value.scores, client, week.value, week.value.teams);

      retVal = process.env.COMPETITION_CHANNEL_NAME + ' message updated successfully.';
    }

    return retVal;
  },
}
