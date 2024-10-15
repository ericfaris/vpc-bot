var numeral = require('numeral');

module.exports = async (instance, channelId, currentWeek) => {
  var braggingRightsChannel = instance.client.channels.cache.get(channelId);

  await braggingRightsChannel.send({
    content: `**Week:** ${currentWeek.weekNumber}\n` +
      `**End Date:** ${currentWeek.periodEnd}\n` +
      `**User: ${currentWeek.scores[0].username}**\n` +
      `**Score:** ${numeral(currentWeek.scores[0].score).format(0, 0)}\n` +
      `**Table:** ${currentWeek.table}\n` +
      `**Table Link:** ${currentWeek.tableUrl}\n` +
      `**VPS Id:** ${currentWeek.vpsId}`
  });
}