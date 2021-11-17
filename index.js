require('dotenv').config()
const DiscordJS = require('discord.js')
const { Intents } = DiscordJS
const WOKCommands = require('wokcommands')
const path = require('path')
//const cron = require('node-cron');
//const responseHelper = require('./helpers/responseHelper');

console.log(`GUILD_ID: ${process.env.GUILD_ID}`);

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
})

client.on('ready', () => {
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, process.env.COMMANDS_DIR),
      featuresDir: path.join(__dirname, process.env.FEATURES_DIR),
      showWarns: false,
      del: process.env.SECONDS_TO_DELETE_MESSAGE,
      botOwners: process.env.BOT_OWNER,
      testServers: process.env.GUILD_ID
    })
})

client.login(process.env.BOT_TOKEN)

// //post JSON files to data-backup channel
// cron.schedule('15 0 * * *', function() {
//   responseHelper.postJsonDataFiles(client);
// });