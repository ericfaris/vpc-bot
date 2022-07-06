require('dotenv').config()
const path = require('path');
const dot = require('mongo-dot-notation')
const outputHelper = require('../helpers/outputHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { ArgHelper } = require('../helpers/argHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit current week.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 1,
  expectedArgs: '<weeknumber> <periodstart> <periodend> <table> <authorname> <versionnumber> <mode> <tableurl> <vpsid> <romurl> <romname> <b2surl> <season> <currentseasonweeknumber> <notes>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    const permissionHelper2 = new PermissionHelper2();
    const argHelper = new ArgHelper();

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const weekNumber = argHelper.getArg(interaction.options.data, 'int', 'weeknumber');
      const periodStart = argHelper.getArg(interaction.options.data, 'string', 'periodstart');
      const periodEnd = argHelper.getArg(interaction.options.data, 'string', 'periodend');
      const table = argHelper.getArg(interaction.options.data, 'string', 'table');
      const authorName = argHelper.getArg(interaction.options.data, 'string', 'authorname');
      const versionNumber = argHelper.getArg(interaction.options.data, 'string', 'versionnumber');
      const mode = argHelper.getArg(interaction.options.data, 'string', 'mode');
      const tableUrl = argHelper.getArg(interaction.options.data, 'string', 'tableurl');
      const vpsId = argHelper.getArg(interaction.options.data, 'string', 'vpsid');
      const romUrl = argHelper.getArg(interaction.options.data, 'string', 'romurl');
      const romName = argHelper.getArg(interaction.options.data, 'string', 'romname');
      const b2sUrl = argHelper.getArg(interaction.options.data, 'string', 'b2surl');
      const season = argHelper.getArg(interaction.options.data, 'int', 'season');
      const currentSeasonWeekNumber = argHelper.getArg(interaction.options.data, 'int', 'currentseasonweeknumber');
      const notes = argHelper.getArg(interaction.options.data, 'string', 'notes');
      const updatedWeek = {};

      weekNumber ? updatedWeek.weekNumber = weekNumber : null;
      periodStart ? updatedWeek.periodStart = periodStart : null;
      periodEnd ? updatedWeek.periodEnd = periodEnd : null;
      table ? updatedWeek.table = table : null;
      authorName ? updatedWeek.authorName = authorName : null;
      versionNumber ? updatedWeek.versionNumber = versionNumber : null;
      mode ? updatedWeek.mode = mode : null;
      tableUrl ? updatedWeek.tableUrl = tableUrl : null;
      vpsId ? updatedWeek.vpsId = vpsId : null;
      romUrl ? updatedWeek.romUrl = romUrl : null;
      romName ? updatedWeek.romName = romName : null;
      b2sUrl ? updatedWeek.b2sUrl = b2sUrl : null;
      season ? updatedWeek.season = season : null;
      currentSeasonWeekNumber ? updatedWeek.currentSeasonWeekNumber = currentSeasonWeekNumber : null;
      notes ? updatedWeek.notes = notes : null;

      const set = dot.flatten(updatedWeek);
      const week = await mongoHelper.findOneAndUpdate({ channelName: channel.name, isArchived: false },
        set,
        { returnDocument: 'after' }, 'weeks');

      if (channel.name === process.env.COMPETITION_CHANNEL_NAME) {
        await outputHelper.editWeeklyCompetitionCornerMessage(week.value.scores, client, week.value, week.value.teams);
        retVal = process.env.COMPETITION_CHANNEL_NAME + ' message updated successfully.';
      } else {
        retVal = `Week updated for the ${channel.name} channel.`;
      }
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}
