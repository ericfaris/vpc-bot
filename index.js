const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  new WOKCommands(client, {
    commandsDir: process.env.COMMANDS_DIR,
    // testServers: [process.env.GUILD_ID],
    showWarns: false,
    del: process.env.SECONDS_TO_DELETE_MESSAGE
  })
})

client.login(process.env.BOT_TOKEN)
