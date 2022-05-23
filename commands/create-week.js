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
  expectedArgs: '<vpsid> <startdateoverride> <enddateoverride> <b2sidoverride> <notes>',
  callback: async ({ args, client, channel, interaction, instance, message}) => {
    let retVal;
    let ephemeral = false;
    let commandHelper = new CommandHelper();
    let vpcDataService = new VPCDataService();
    let vpsDataService = new VPSDataService();

    await interaction.deferReply();

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`);
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
      ephemeral = true;
    } else if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      ephemeral = true;
    } else {
      const [vpsid, startdateoverride, enddateoverride, b2sidoverride, notes] = args;
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
        const currentSeason = await mongoHelper.findCurrentSeason(channel.name);
        const currentWeek = await vpcDataService.getCurrentWeek(channel.name);
      
        weekNumber = parseInt(currentWeek.weekNumber) + 1;
        currentSeasonWeekNumber = parseInt(currentWeek.currentSeasonWeekNumber) + 1;
        periodStart = startdateoverride ?? date.format(date.addDays(date.parse(currentWeek.periodStart, 'YYYY-MM-DD'), 7), 'YYYY-MM-DD');
        periodEnd = enddateoverride ?? date.format(date.addDays(date.parse(currentWeek.periodEnd, 'YYYY-MM-DD'), 7), 'YYYY-MM-DD');
        table = `${vpsGame?.name} (${vpsGame?.manufacturer} ${vpsGame?.year})`;
        authorName = vpsGame.table?.authors?.join(', ') ?? '';
        versionNumber = vpsGame?.table?.version ?? '';
        tableUrl = vpsGame.table?.urls[0]?.url ?? '';
        romUrl = vpsGame?.romFiles ? vpsGame?.romFiles[0]?.urls[0]?.url ?? '' : '';
        romName = vpsGame?.romFiles ? vpsGame?.romFiles[0]?.version ?? '' : '';
        b2sUrl = b2sidoverride ? vpsGame?.b2sFiles.find(b => b.id === b2sidoverride)?.urls[0]?.url : (vpsGame?.b2sFiles[0]?.urls[0]?.url ?? '') ;

        var newWeek = {
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
          'b2sUrl': b2sUrl,
          'season': currentSeason?.seasonNumber ? parseInt(currentSeason?.seasonNumber) : null,
          'currentSeasonWeekNumber': currentSeasonWeekNumber,
          'notes': notes,
          'scores': [],
          'teams': [],
          'isArchived': false
        }

        await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { isArchived: true } }, null, 'weeks');
        await mongoHelper.insertOne(newWeek, 'weeks');

        if (channel.name === process.env.COMPETITION_CHANNEL_NAME) {
          await outputHelper.editWeeklyCompetitionCornerMessage(newWeek.scores, client, newWeek, newWeek.teams);

          if(currentSeason) {
            const weeksInSeason = await mongoHelper.find({
              channelName: channel.name,
              isArchived: true,
              periodStart: { $gte: currentSeason.seasonStart },
              periodEnd: { $lte: currentSeason.seasonEnd }
            }, 'weeks');

            await outputHelper.editSeasonCompetitionCornerMessage(currentSeason, weeksInSeason, client)
          }

          retVal = `New week created and the ${process.env.COMPETITION_CHANNEL_NAME} pinned message was updated successfully.`;
        } else {
          retVal = `New week created for the ${channel.name} channel.`;
        }
  
        await commandHelper.execute(instance, interaction, message, 'create-high-score-table', [newWeek.vpsId]);

        if (channel.name === process.env.COMPETITION_CHANNEL_NAME) {
          client.emit('advancePlayoffRound', channel, currentWeek);
          client.emit('postBraggingRights', process.env.BRAGGING_RIGHTS_CHANNEL_ID, currentWeek);
        }  

        interaction.editReply({content: retVal, ephemeral: ephemeral});
      } else {
        retVal = `No VPS Tables were found.  Please double check your VPS ID.`;
      }
    }
  },
}
 