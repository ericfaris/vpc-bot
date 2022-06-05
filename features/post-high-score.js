const Logger = require('../helpers/loggingHelper');
const { SearchScorePipelineHelper } = require('../helpers/pipelineHelper');
const date = require('date-and-time');
const postHighScoreCommand = require('../commands/post-high-score');
const showTableHighScoresCommand = require('../commands/show-table-high-scores');
var numeral = require('numeral');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = (client, user, instance, channel, message) => {
    let logger = (new Logger(user)).logger;

    client.on('interactionCreate', async interaction => {
      if (!interaction.isSelectMenu()) return;
    
      if (interaction.customId === 'select') {
        let commandName = interaction?.message?.interaction?.commandName ?? interaction?.message?.nonce;
        
        switch(commandName) {
          case 'post-high-score':
              let selectedJson = JSON.parse(interaction.values[0]);
              let pipeline = (new SearchScorePipelineHelper(selectedJson.id)).pipeline;
              const tables = await mongoHelper.aggregate(pipeline, 'tables');
              let existingUser;

              try {
                if(tables.length === 1) {
                  let data = tables[0];
                  selectedJson.tableName = data.tableName;
                  selectedJson.authorName = data.authorName;
                  selectedJson.versionNumber = data.versionNumber;
                  selectedJson.vpsId = data.vpsId;
                  let newScore = selectedJson.s;
                  let existingScore = data?.score;

                  let authorsArray = selectedJson?.authorName?.split(', ');
                  let firstAuthor = authorsArray?.shift();
                  
                  if(data?.user?.id) {
                    existingUser = await interaction.client.users.fetch(data?.user.id);
                  }

                  if((!existingScore) || (newScore > existingScore)) {
                    await postHighScoreCommand.saveHighScore(selectedJson, interaction).then(async () => {
                      const user = await client.users.cache.find(user => user.username === selectedJson.u)
                      await interaction.update({
                        content: 
                          `**NEW TOP HIGH SCORE POSTED:**\n` + 
                          `**User**: <@${user.id}>\n` + 
                          `**Table:** ${selectedJson.tableName} ( ${firstAuthor}... ${selectedJson.versionNumber})**\n` +
                          `**Score: **${numeral(selectedJson.s).format('0,0')}\n` +
                          `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`,
                        components: []
                      });

                      logger.info(`Trying to show high scores for ${selectedJson.tableName}`)
                      await showTableHighScoresCommand.callback( {args: [selectedJson.tableName, false], client: client, channel: channel ?? interaction.channel, interaction: interaction, instance: instance, message: message, user: user});

                      logger.info('Checking to send a DM to user who had high score.')
                      if(existingUser && (existingUser.username !== user.username)) {
                        let content = `**@${user?.username}** just topped your high score for**:\n` +
                        `${selectedJson?.tableName} (${firstAuthor}... ${selectedJson?.versionNumber})**\n` +
                        `**Score: **${numeral(selectedJson?.s).format('0,0')}\n` +
                        `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n\n` +
                        `Link: ${interaction?.message?.url}`;

                        logger.info('Sending DM to previous High Score holder.')
                        await existingUser.send(content);
                      };
                    }).catch(async (e) => {
                      logger.error(e)
                      await interaction.followUp({
                        content: `${e}`, 
                        components: [], 
                        files: [],
                      });
                    });
                  } else {
                    await postHighScoreCommand.saveHighScore(selectedJson, interaction)
                      .then(async () => {
                        const user = await client.users.cache.find(user => user.username === selectedJson.u)
                        await interaction.update({
                          content: 
                            `**NEW HIGH SCORE POSTED:**\n` + 
                            `**User**: <@${user.id}>\n` + 
                            `**Table:** ${selectedJson.tableName} (${firstAuthor}... ${selectedJson.versionNumber})\n` +
                            `**Score: **${numeral(selectedJson.s).format('0,0')}\n` +
                            `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`,
                          components: []
                        });
                        await showTableHighScoresCommand.callback( {args: [selectedJson.tableName, false], client: client, channel: channel ?? interaction.channel, interaction: interaction, instance: instance, message: message, user: user});
                      }).catch(async (e) => {
                        logger.error(e)
                        await interaction.followUp({
                          content: `${e}`, 
                          components: [], 
                          files: [],
                        });
                      });
                  }
                  break;
                } else if(tables.length === 0) {
                  throw new Error('No matches found.');
                } else {
                  throw new Error('Multiple matches found.');
                }
              } catch(e) {
                logger.error(e);
                await interaction.followUp({
                  content: `${e}`, 
                  components: [],
                  files: [],
                });
              }
          
          default:
            console.log(commandName);
        }		
      }
    });

    client.on('postHighScore', async function (user, score, attachment, currentWeek, channelId, postSubscript, postDescription, doPost) {
      var channel = client.channels.cache.get(channelId);
      
      var data = {
        tableName: currentWeek.table,
        authorName: currentWeek.authorName,
        versionNumber: currentWeek.versionNumber,
        vpsId: currentWeek.vpsId,
        u: user.username,
        s: score
      };

      var interaction = {
        user: user,
        message: {
          url: ''
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
                                    `**Score: **${numeral(data.s).format('0,0')}\n` +
                                    `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n` +
                                    `*${postSubscript}*`
                              , files: [attachment]}).then(async (message) => {
              data.scoreId = highScoreId;
              await postHighScoreCommand.updateHighScore(data, message.url);
              await showTableHighScoresCommand.callback( {args: [data.tableName, false], client: client, channel: channel, interaction: interaction, instance: instance, message: message, user: user});
            });
          }
        });
      }
    });
}