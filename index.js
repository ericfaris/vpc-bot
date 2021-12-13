require('dotenv').config()
const Logger = require('./helpers/loggingHelper');
const DiscordJS = require('discord.js')
const { Intents } = DiscordJS
const mongoHelper = require('./helpers/mongoHelper');
const { SearchScorePipelineHelper } = require('./helpers/pipelineHelper');
var numeral = require('numeral');
const date = require('date-and-time');
const WOKCommands = require('wokcommands')
const path = require('path')
const postHighScoreCommand = require('./commands/post-high-score');

//const cron = require('node-cron');
//const responseHelper = require('./helpers/responseHelper');
let logger = (new Logger(null)).logger;

logger.info('Starting bot');
logger.info(`BOT_TOKEN: ${process.env.BOT_TOKEN}`);
logger.info(`COMMANDS_DIR: ${process.env.COMMANDS_DIR}`);
logger.info(`FEATURES_DIR: ${process.env.FEATURES_DIR}`);
logger.info(`COMPETITION_CHANNEL_NAME: ${process.env.COMPETITION_CHANNEL_NAME}`);
logger.info(`COMPETITION_CHANNEL_ID: ${process.env.COMPETITION_CHANNEL_ID}`);
logger.info(`COMPETITION_WEEKLY_POST_ID: ${process.env.COMPETITION_WEEKLY_POST_ID}`);
logger.info(`COMPETITION_SEASON_POST_ID: ${process.env.COMPETITION_SEASON_POST_ID}`);
logger.info(`DATA_BACKUPS_CHANNEL_ID: ${process.env.DATA_BACKUPS_CHANNEL_ID}`);
logger.info(`GUILD_ID: ${process.env.GUILD_ID}`);
logger.info(`APPLICATION_ID: ${process.env.APPLICATION_ID}`);
logger.info(`DISCORD_BASE_API: ${process.env.DISCORD_BASE_API}`);
logger.info(`SECONDS_TO_DELETE_MESSAGE: ${process.env.SECONDS_TO_DELETE_MESSAGE}`);
logger.info(`DB_NAME: ${process.env.DB_NAME}`);
logger.info(`BOT_OWNER: ${process.env.BOT_OWNER}`);
logger.info(`HIGH_SCORES_CHANNEL_NAME: ${process.env.HIGH_SCORES_CHANNEL_NAME}`);
logger.info(`HIGH_SCORES_CHANNEL_ID: ${process.env.HIGH_SCORES_CHANNEL_ID}`);

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
})

client.on('ready', () => {
    logger.info('Loading commands');
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, process.env.COMMANDS_DIR),
      featuresDir: path.join(__dirname, process.env.FEATURES_DIR),
      showWarns: false,
      delErrMsgCooldown: process.env.SECONDS_TO_DELETE_MESSAGE,
      botOwners: process.env.BOT_OWNER,
      testServers: process.env.GUILD_ID
    })
    logger.info('Bot is ready for work');
})

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

client.login(process.env.BOT_TOKEN)

// //post JSON files to data-backup channel
// cron.schedule('15 0 * * *', function() {
//   responseHelper.postJsonDataFiles(client);
// });