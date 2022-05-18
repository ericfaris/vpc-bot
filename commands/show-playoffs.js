require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show playoffs for the channel.',
  callback: async ({ channel, interaction }) => {
    let retVal;

    if (!process.env.CHANNELS_WITH_SCORES.split(',').includes(channel.name)) {
      retVal = `The ${module.exports.commandName} slash command cannot be used in this channel.`;
      interaction.reply({content: retVal, ephemeral: true});
    } else {
      module.exports.getPlayoffRoundMatchups(interaction, channel);
    }
  },

  getPlayoffRoundMatchups : async (interaction, channel) => {
    const currentSeason = await mongoHelper.findCurrentSeason(channel.name);
    const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);
    const currentPlayoffRound = await mongoHelper.findCurrentPlayoffRound(channel.name);
    const currentWeek = await  mongoHelper.findCurrentWeek(channel.name);

    let games = [];

    for(let i = 0; i < currentPlayoff.seeds.length; i=i+2) {
      let awaySeed = parseInt(currentPlayoffRound.games[i]);
      let awayUsername = currentPlayoff.seeds[awaySeed-1]?.username;
      let awayScore = currentWeek.scores.find(x => x.username === awayUsername)?.score ?? null;
      let homeSeed = parseInt(currentPlayoffRound.games[i+1]);
      let homeUsername = currentPlayoff.seeds[homeSeed-1]?.username;
      let homeScore = currentWeek.scores.find(x => x.username === homeUsername)?.score ?? null;

      game = {
        away: {
          seed: awaySeed, 
          username: awayUsername, 
          score: awayScore
        },
        home:  {
          seed: homeSeed, 
          username: homeUsername, 
          score: homeScore
        },
      }
      games.push(game);
    }

    await responseHelper.showPlayoffMatchups(games, interaction, true);
  },

}