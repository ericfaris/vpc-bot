const Logger = require('../../helpers/loggingHelper');
const { SearchScorePipelineHelper } = require('../../helpers/pipelineHelper');
const date = require('date-and-time');
const postHighScoreCommand = require('../../commands/post-high-score');
const showTableHighScoresCommand = require('../../commands/show-table-high-scores');
var numeral = require('numeral');
const mongoHelper = require('../../helpers/mongoHelper');

module.exports = async (instance, user, score, attachment, currentWeek, channelId, postSubscript, postDescription, doPost) => {

    var client = instance.client;
    var channel = client.channels.cache.get(channelId);
    
    var data = {
      tableName: currentWeek.table,
      authorName: currentWeek.authorName,
      versionNumber: currentWeek.versionNumber,
      vpsId: currentWeek.vpsId,
      mode: currentWeek.mode,
      u: user.username,
      s: score
    };

    var interaction = {
      user: user,
      message: {
        url: ''
      },
      options: {
        data: [
        ]
      }
    };

    const highScoreExists = await postHighScoreCommand.highScoreExists(data);

    if(!highScoreExists) {
      postHighScoreCommand.saveHighScore(data, interaction).then(async (newHighScore) => {
        const highScoreId = newHighScore?.authors.find(a => a.vpsId === data.vpsId)
                                ?.versions.find(v => v.versionNumber === data.versionNumber)
                                ?.scores.reduce((a,b) => a.score > b.score ? a : b)?._id.toString();

        let authorsArray = data?.authorName?.split(', ');
        let firstAuthor = authorsArray?.shift();
                  
        if(doPost) {
          await channel.send({content: 
                                  `**NEW HIGH SCORE POSTED:**\n` + 
                                  `**User**: <@${user.id}>\n` + 
                                  `**Table:** ${data.tableName}\n` +
                                  ((data.mode ?? 'default') != 'default' ? `**Mode:** ${data.mode}\n` : '') +
                                  `**VPS Id:** ${data.vpsId}\n` +
                                  `**Score:** ${numeral(data.s).format('0,0')}\n` +
                                  `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n` +
                                  `*${postSubscript}*`
                            , files: [attachment]}).then(async (message) => {
            data.scoreId = highScoreId;
            await postHighScoreCommand.updateHighScore(data, message.url);

            interaction.options.data.push({name: 'tablesearchterm', value: data.tableName});
            interaction.options.data.push({name: 'vpsid', value: data.vpsId});
            interaction.options.data.push({name: 'isephemeral', value: 'false'});
            await showTableHighScoresCommand.callback( {args: [data.tableName, data.vpsId, false], client: client, channel: channel, interaction: interaction, instance: instance, message: message, user: user});
          });
        }
      });
    };
}

