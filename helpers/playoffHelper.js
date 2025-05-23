class PlayoffHelper {

  constructor() { };

  getCurrentPlayoffMatchups(week, playoff, round) {
    let games = [];

    for (let i = 0; i < round.games.length; i = i + 2) {
      let awaySeed = parseInt(round.games[i]);
      let awayUsername = playoff.seeds[awaySeed - 1]?.username;
      let awayScore = week.scores.find(x => x.username === awayUsername)?.score ?? null;
      let homeSeed = parseInt(round.games[i + 1]);
      let homeUsername = playoff.seeds[homeSeed - 1]?.username;
      let homeScore = week.scores.find(x => x.username === homeUsername)?.score ?? null;

      let game = {
        away: {
          seed: awaySeed,
          username: awayUsername,
          score: awayScore
        },
        home: {
          seed: homeSeed,
          username: homeUsername,
          score: homeScore
        },
      }
      games.push(game);
    }

    return games;
  }

  findWinningSeeds(games) {
    let roundWinners = [];

    games.forEach(game => {
      let winningSeed = game.home.score >= game.away.score ? game.home.seed : game.away.seed;
      roundWinners.push(winningSeed);
    })

    return roundWinners;
  }

  getRoundName(remainingParticipants) {
    var roundName = 'Unknown Round';

    switch (remainingParticipants) {
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

    return roundName
  }

}

module.exports.PlayoffHelper = PlayoffHelper;