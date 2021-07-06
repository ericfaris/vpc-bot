const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  new WOKCommands(client, {
    commandsDir: process.env.COMMANDS_DIR,
    // testServers: [process.env.ERICFARIS_TEST_SERVER_ID],
    showWarns: false,
    del: 4
  })
})

client.login(process.env.BOT_TOKEN)
