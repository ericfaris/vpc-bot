require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PlayoffHelper } = require('../helpers/playoffHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show playoffs for the channel.',
  callback: async ({ channel, interaction}) => {
    let retVal;
    let playoffHelper = new PlayoffHelper();

    if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);
      const currentPlayoffRound = await mongoHelper.findCurrentPlayoffRound(channel.name);
      const currentWeek = await  mongoHelper.findCurrentWeek(channel.name);

      const games = playoffHelper.getCurrentPlayoffMatchups(currentWeek, currentPlayoff, currentPlayoffRound);
      return await responseHelper.showPlayoffMatchups(games, interaction, true);
    }
  },
}