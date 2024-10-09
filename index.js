const Logger = require('./helpers/loggingHelper');
const { Client, IntentsBitField, Partials } = require("discord.js");
const WOKCommands = require("wokcommands");
const path = require("path");
require("dotenv/config");

//const cron = require('node-cron');
let logger = (new Logger(null)).logger;

logger.info('Starting bot');
logger.info(`BOT_TOKEN: ${process.env.BOT_TOKEN}`);
logger.info(`BOT_USER: ${process.env.BOT_USER}`);
logger.info(`BOT_CONTEST_ADMIN_ROLE_NAME: ${process.env.BOT_CONTEST_ADMIN_ROLE_NAME}`);
logger.info(`BOT_HIGH_SCORE_ADMIN_ROLE_NAME: ${process.env.BOT_HIGH_SCORE_ADMIN_ROLE_NAME}`);
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
logger.info(`VPC_DATA_SERVICE_API_URI: ${process.env.VPC_DATA_SERVICE_API_URI}`);
logger.info(`VPS_DATA_SERVICE_API_URI: ${process.env.VPS_DATA_SERVICE_API_URI}`);
logger.info(`BRAGGING_RIGHTS_CHANNEL_NAME: ${process.env.BRAGGING_RIGHTS_CHANNEL_NAME}`);
logger.info(`BRAGGING_RIGHTS_CHANNEL_ID: ${process.env.BRAGGING_RIGHTS_CHANNEL_ID}`);
logger.info(`CHANNELS_WITH_SCORES: ${process.env.CHANNELS_WITH_SCORES}`);
logger.info(`CONTEST_CHANNELS: ${process.env.CONTEST_CHANNELS}`);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.on('ready', () => {
    logger.info('Loading commands');
    new WOKCommands({
      client,
      commandsDir: path.join(__dirname, process.env.COMMANDS_DIR),
      events: {
        dir: path.join(__dirname, "events"),
      },
      //featuresDir: path.join(__dirname, process.env.FEATURES_DIR),
      //showWarns: false,
      //delErrMsgCooldown: process.env.SECONDS_TO_DELETE_MESSAGE,
      botOwners: [process.env.BOT_OWNER],
      testServers: [process.env.GUILD_ID]
    })
    logger.info('Bot is ready for work');
})

client.login(process.env.BOT_TOKEN)

// //post JSON files to data-backup channel
// cron.schedule('15 0 * * *', function() {
//   responseHelper.postJsonDataFiles(client);
// });