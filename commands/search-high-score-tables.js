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
  description: 'Search high score tables',
  minArgs: 1,
  expectedArgs: '<tablesearchterm>',
  callback: async ({ args, channel, interaction, instance }) => {
    let retVal;
    const [tableSearchTerm] = args;

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {

      const pipeline = [
        { $match: {tableName:{$regex:'.*' + tableSearchTerm + '.*', $options: 'i'}}},
        { $unwind: "$authors" },
        { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
        { $unwind: { "path": "$authors.versions.scores", "preserveNullAndEmptyArrays": true } },
        { $project: {
          tableName: '$tableName',
          authorName: "$authors.authorName",
          version: '$authors.versions.version',
          tableUrl: '$authors.versions.versionUrl',
          userName: '$authors.versions.scores.username',
          score: '$authors.versions.scores.score',
          posted: '$authors.versions.scores.createdAt',
          postUrl: '$authors.versions.scores.postUrl',
          _id: 0
        }},
        { $sort: {tableName: 1, authorName: -1, version: -1, score: -1} },
        { $group: {
          _id: {
            tableName: '$tableName',
            authorName: "$authorName",
            version: '$version',
            tableUrl: '$versionUrl',
            userName: '$authors.versions.scores.username',
            score: '$authors.versions.scores.score',
            posted: '$authors.versions.scores.createdAt',
            postUrl: '$authors.versions.scores.postUrl',
          },
          group: {$first:'$$ROOT'}
        }},
        {$replaceRoot:{newRoot:"$group"}},
        { $sort: {tableName: 1, authorName: -1, version: -1} }
      ];

      const tables = await mongoHelper.aggregate(pipeline, 'tables');

      responseHelper.showEphemeralHighScoreTables(tables, tableSearchTerm, interaction)
      responseHelper.deleteOriginalMessage(interaction, 0);

      retVal = 'showing leaderboard...';
    }

    return retVal;
  },
}