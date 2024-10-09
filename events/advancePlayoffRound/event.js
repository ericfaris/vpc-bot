const mongoHelper = require('../../helpers/mongoHelper');
const { PlayoffHelper } = require('../../helpers/playoffHelper');

module.exports = async (instance, interaction, currentWeek) => {
    const channel = interaction.channel;
    const playoffHelper = new PlayoffHelper();

    const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);

    if (currentPlayoff) {
        const currentPlayoffRound = await mongoHelper.findCurrentPlayoffRound(channel.name);
        const games = playoffHelper.getCurrentPlayoffMatchups(currentWeek, currentPlayoff, currentPlayoffRound);
        const winningSeeds = playoffHelper.findWinningSeeds(games);
        let roundName = playoffHelper.getRoundName(winningSeeds.length);

        const currentSeason = await mongoHelper.findOne({
            channelName: channel.name,
            isArchived: false
        }, 'seasons');

        await mongoHelper.updateOne({
            seasonNumber: parseInt(currentSeason.seasonNumber),
            isArchived: false
        }, {
            $set: { isArchived: true }
        }, null, 'rounds');

        await mongoHelper.insertOne({
            'channelName': channel.name,
            'seasonNumber': parseInt(currentSeason.seasonNumber),
            'roundName': roundName,
            'games': winningSeeds,
            'isArchived': false
        }, 'rounds');

        await channel.send({ content: `Advanced playoff round.` });
    }
}