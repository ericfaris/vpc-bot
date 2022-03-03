require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit Current Week Details for Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 6,
  expectedArgs: '<weeknumber> <periodstart> <periodend> <table> <authorname> <versionnumber> <tableurl> <romurl> <romname> <currentseasonweeknumber> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
    } else {
      const [weeknumber, periodstart, periodend, table, authorname, versionnumber, tableurl, romurl, romname, currentseasonweeknumber, notes] = args;

      const week = await mongoHelper.findOneAndUpdate({ channelName: channel.name, isArchived: false }, {
        $set: {
          'channelName': channel.name,
          'weekNumber': weeknumber,
          'periodStart': periodstart,
          'periodEnd': periodend,
          'table': table ?? '',
          'authorName': authorname ?? '',
          'versionNumber': versionnumber ?? '',
          'tableUrl': tableurl ?? '',
          'romUrl': romurl ?? '',
          'romName': romname ?? '',
          'currentSeasonWeekNumber': currentseasonweeknumber ?? '',
          'notes': notes ?? ''
        }
      }, { returnDocument: 'after' }, 'weeks');

      if (channel.name === channel.COMPETITION_CHANNEL_NAME) {
        await outputHelper.editWeeklyCompetitionCornerMessage(week.value.scores, client, week.value, week.value.teams);
        retVal = process.env.COMPETITION_CHANNEL_NAME + ' message updated successfully.';
      } else {
        retVal = `Week updated for the ${channel.name} channel.`;
      }

    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}
