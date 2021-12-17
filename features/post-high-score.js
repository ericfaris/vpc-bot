const Logger = require('../helpers/loggingHelper');
const { SearchScorePipelineHelper } = require('../helpers/pipelineHelper');
const date = require('date-and-time');
const postHighScoreCommand = require('../commands/post-high-score');
var numeral = require('numeral');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = (client, instance, user) => {
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
    
              try {
                if(tables.length === 1) {
                  let data = tables[0];
                  selectedJson.tableName = data.tableName;
                  selectedJson.authorName = data.authorName;
                  selectedJson.versionNumber = data.versionNumber;
                  let newScore = selectedJson.s;
                  let existingScore = data?.score;
    
                  if((!existingScore) || (newScore > existingScore)) {
                    await postHighScoreCommand.saveHighScore(selectedJson, interaction).then(async () => {
                      const user = await client.users.cache.find(user => user.username === selectedJson.u)
                      await interaction.update({
                        content: `**<@${user.id}>** just posted a high score for **${selectedJson.tableName} ` + 
                          `(${selectedJson.authorName} ${selectedJson.versionNumber})**\n` +
                          `**High Score: **${numeral(selectedJson.s).format('0,0')}\n` +
                          `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`, 
                        components: []
                      });
                    })
                    .catch(async (err) => {
                      logger.error(err)
                      await interaction.update({
                        content: `${err}`, 
                        components: [],
                        files: [],
                      });
                    });
                  } else {
                    throw new Error('Submitted score is NOT greater than existing high score.');
                  }
                  break;
                } else if(tables.length === 0) {
                  throw new Error('No matches found.');
                } else {
                  throw new Error('Multiple matches found.');
                }
              } catch(e) {
                logger.error(e);
                await interaction.update({
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
}