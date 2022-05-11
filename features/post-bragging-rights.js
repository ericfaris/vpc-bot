var numeral = require('numeral');

module.exports = (client, user, instance, channel, message) => {
  client.on('postBraggingRights', async function (channelId, currentWeek) {
    var channel = client.channels.cache.get(channelId);

    await channel.send({content: `**Week:** ${currentWeek.weekNumber}\n` +
                                 `**End Date:** ${currentWeek.periodEnd}\n` +
                                 `**User: ${currentWeek.scores[0].username}**\n` +
                                 `**Score:** ${numeral(currentWeek.scores[0].score).format(0,0)}\n` +
                                 `**Table:** ${currentWeek.table}\n` + 
                                 `**Table Link:** ${currentWeek.tableUrl}\n` +
                                 `**VPS Id:** ${currentWeek.vpsId}`});
  });
}