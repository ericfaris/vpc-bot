require('dotenv').config()
const path = require('path');
const date = require('date-and-time');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { CommandHelper } = require('../helpers/commandHelper');
const { VPCDataService } = require('../services/vpcDataService')
const { VPSDataService } = require('../services/vpsDataService');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new week by VPS ID (MANAGE_GUILD)',
  roles: ['Competition Corner Mod'],
  minArgs: 1,
  expectedArgs: '<vpsid> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    let ephemeral = false;
    let commandHelper = new CommandHelper();
    let vpcDataService = new VPCDataService();
    let vpsDataService = new VPSDataService();

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`);
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
      ephemeral = true;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      ephemeral = true;
    } else {
      const [vpsid, notes] = args;
      let weekNumber;
      let periodStart;
      let periodEnd;
      let table;
      let authorName;
      let versionNumber;
      let tableUrl;
      let romUrl;
      let romName;
      let currentSeasonWeekNumber;

      const vpsGame = await vpsDataService.getVpsGame(vpsid);

      if (vpsGame.table) {
        const currentWeek = await vpcDataService.getCurrentWeek(channel.name);

        weekNumber = parseInt(currentWeek.weekNumber) + 1;
        currentSeasonWeekNumber = parseInt(currentWeek.currentSeasonWeekNumber) + 1;
        periodStart = date.format(date.addDays(date.parse(currentWeek.periodStart, 'YYYY-MM-DD'), 7), 'YYYY-MM-DD');
        periodEnd = date.format(date.addDays(date.parse(currentWeek.periodEnd, 'YYYY-MM-DD'), 7), 'YYYY-MM-DD');
        table = `${vpsGame?.name} (${vpsGame?.year} ${vpsGame?.manufacturer})`;
        authorName = vpsGame.table?.authors?.join(", ") ?? '';
        versionNumber = vpsGame.table?.version ?? '';
        tableUrl = vpsGame.table?.urls[0]?.url ?? '';
        romUrl = vpsGame?.romFiles[0]?.urls[0]?.url ?? '';
        romName = vpsGame?.romFiles[0]?.version ?? '';

        var week = {
          'channelName': channel.name,
          'weekNumber': weekNumber,
          'periodStart': periodStart,
          'periodEnd': periodEnd,
          'table': table,
          'authorName': authorName,
          'versionNumber': versionNumber,
          'vpsId': vpsid,
          'tableUrl': tableUrl,
          'romUrl': romUrl,
          'romName': romName,
          'currentSeasonWeekNumber': currentSeasonWeekNumber,
          'notes': notes,
          'scores': [],
          'teams': [],
          'isArchived': false
        }

        await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { isArchived: true } }, null, 'weeks');
        await mongoHelper.insertOne(week, 'weeks');

        if (channel.name === process.env.COMPETITION_CHANNEL_NAME) {
          await outputHelper.editWeeklyCompetitionCornerMessage(week.scores, client, week, week.teams);
          retVal = `New week created and the ${process.env.COMPETITION_CHANNEL_NAME} message was updated successfully.`;
        } else {
          retVal = `New week created for the ${channel.name} channel.`;
        }

        interaction.reply({content: retVal, ephemeral: ephemeral, fetchReply: true}).then(async message => {
          await commandHelper.execute(instance, interaction, 'create-high-score-table', [week.table, week.authorName, week.versionNumber, week.vpsId, week.tableUrl, week.romName])
        })
      } else {
        retVal = `No VPS Tables were found.  Please double check your VPS ID.`;
      }
    }
  },
}
