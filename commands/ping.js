const { MessageEmbed } = require('discord.js')

module.exports = {
  slash: true,
  testOnly: true,
  description: 'A simple ping pong command!!!',
  callback: ({}) => {
    return 'pong'
  },
}