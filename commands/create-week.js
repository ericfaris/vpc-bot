require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new week (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 4,
  expectedArgs: '<weeknumber> <periodstart> <periodend> <table> <tableurl> <romurl> <currentseasonweeknumber> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      const [weeknumber, periodstart, periodend, table, tableurl, romurl, currentseasonweeknumber, notes] = args;

      var week =
      {
        'weekNumber': weeknumber,
        'periodStart': periodstart,
        'periodEnd': periodend,
        'table': table,
        'tableUrl': tableurl,
        'romUrl': romurl,
        'currentSeasonWeekNumber': currentseasonweeknumber,
        'notes': notes,
        'scores': [],
        'teams': [],
        'isArchived': false
      }

      await mongoHelper.updateOne({ isArchived: false }, { $set: { isArchived: true } }, null, 'weeks');

      await mongoHelper.insertOne(week, 'weeks');

      await outputHelper.editWeeklyCompetitionCornerMessage(week.scores, client, week, week.teams);

      retVal = `New week created and the ${process.env.COMPETITION_CHANNEL_NAME} message wasupdated successfully.`;
    }

    return retVal;
  },
}
