const mongoHelper = require('../helpers/mongoHelper');
const { PlayoffHelper } = require('../helpers/playoffHelper');

module.exports = (client, channel) => {
  client.on('advancePlayoffRound', async function (channel, currentWeek) {
    const playoffHelper = new PlayoffHelper();

    const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);
    const currentPlayoffRound = await mongoHelper.findCurrentPlayoffRound(channel.name);

    const games = playoffHelper.getCurrentPlayoffMatchups(currentWeek, currentPlayoff, currentPlayoffRound);
    const winningSeeds = playoffHelper.findWinningSeeds(games);

    switch(winningSeeds.length) {
      case 16:
        roundName = '1st Round';
        break;
      case 8:
        roundName = '2nd Round';
        break;
      case 4:
        roundName = 'Semifinal Round';
        break;
      case 2:
        roundName = 'Championship Round';
        break;
    }

    const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');
    await mongoHelper.updateOne({ seasonNumber: parseInt(currentSeason.seasonNumber), isArchived: false }, { $set: { isArchived: true } }, null, 'rounds');

    let round = {
      'channelName' : channel.name,
      'seasonNumber' : parseInt(currentSeason.seasonNumber),
      'roundName' : roundName,
      'games' : winningSeeds,
      'isArchived' : false
    }

    await mongoHelper.insertOne(round, 'rounds');

    await channel.send({content: `Advanced playoff round.`});
  });
}