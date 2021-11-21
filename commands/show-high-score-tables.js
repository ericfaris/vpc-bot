require('dotenv').config()
const path = require('path');
var Table = require('easy-table')
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show high score tables',
  callback: async ({ channel, interaction, instance }) => {
    let retVal;

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {

      const pipeline = [
        { $unwind: "$authors" },
        { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
        { $project: {
          tableName: 1,
          authorName: "$authors.authorName",
          version: '$authors.versions.version',
          _id: 0
        }},
        { $sort: {tableName: 1, authorName: 1, version: 1} }
      ];

      const tables = await mongoHelper.aggregate(pipeline, 'tables');

      // responseHelper.showEphemeralLeaderboard(currentWeek.scores, currentWeek.teams, interaction)
      // responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing leaderboard...';
    }

    return retVal;
  },
}