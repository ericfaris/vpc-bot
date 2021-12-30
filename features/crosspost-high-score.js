const date = require('date-and-time');
const postHighScoreCommand = require('../commands/post-high-score');
var numeral = require('numeral');

module.exports = (client, instance, user) => {

    client.on('crosspostHighScore', async function (user, score, attachment, currentWeek, channelId) {
      var channel = client.channels.cache.get(channelId);
      
      var data = {
        tableName: currentWeek.table,
        authorName: currentWeek.authorName,
        versionNumber: currentWeek.versionNumber,
        u: user.username,
        s: score
      };

      var interaction = {
        user: user,
        message: {
          url: ''
        }
      };

      postHighScoreCommand.saveHighScore(data, interaction).then(async (newHighScore) => {
        const highScoreId = newHighScore?.authors.find(a => a.authorName === data.authorName)
                                ?.versions.find(v => v.versionNumber === data.versionNumber)
                                ?.scores.reduce((a,b) => a.score > b.score ? a : b)?._id.toString();
        await channel.send({content:  `**HIGH SCORE ALERT**\n` + 
                                `**<@${user.id}>** just posted a high score for**\n` + 
                                `${data.tableName} (${data.authorName} ${data.versionNumber})**\n` +
                                `**Score: **${numeral(data.s).format('0,0')}\n` +
                                `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`
                      , files: [attachment]}).then(async (message) => {
                        data.scoreId = highScoreId;
                        await postHighScoreCommand.updateHighScore(data, message.url);
        })
      });
    });
}
