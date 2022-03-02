require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { CommandHelper } = require('../helpers/commandHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new week (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 6,
  expectedArgs: '<weeknumber> <periodstart> <periodend> <table> <authorname> <versionnumber> <tableurl> <romurl> <romname> <currentseasonweeknumber> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    let ephemeral = false;
    let commandHelper = new CommandHelper();

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`);
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
      ephemeral = true;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      ephemeral = true;
    } else {
      const [weeknumber, periodstart, periodend, table, authorname, versionnumber, tableurl, romurl, romname, currentseasonweeknumber, notes] = args;

      var week =
      {
        'channelName': channel.name,
        'weekNumber': weeknumber,
        'periodStart': periodstart,
        'periodEnd': periodend,
        'table': table,
        'authorName': authorname,
        'versionNumber': versionnumber,
        'tableUrl': tableurl,
        'romUrl': romurl,
        'romName': romname,
        'currentSeasonWeekNumber': currentseasonweeknumber,
        'notes': notes,
        'scores': [],
        'teams': [],
        'isArchived': false
      }

      await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { isArchived: true } }, null, 'weeks');
      await mongoHelper.insertOne(week, 'weeks');
      if (channel.COMPETITION_CHANNEL_NAME) {
        await outputHelper.editWeeklyCompetitionCornerMessage(week.scores, client, week, week.teams);
        retVal = `New week created and the ${process.env.COMPETITION_CHANNEL_NAME} message was updated successfully.`;
      } else {
        retVal = `New week created for the ${channel.name} channel.`;
      }
    }

    interaction.reply({content: retVal, ephemeral: ephemeral, fetchReply: true}).then(async message => {
      await commandHelper.execute(instance, interaction, 'create-high-score-table', [week.table, week.authorName, week.versionNumber, week.tableUrl, week.romName])
    })
  },
}
