const showLeaderboardCommand = require('../../commands/show-leaderboard');
const Logger = require('../../helpers/loggingHelper');

module.exports = async (interaction, instance) => {
  let logger = (new Logger(interaction.user)).logger;

  try {
    if (interaction.customId != 'showLeaderboard') return;
    await showLeaderboardCommand.getLeaderboard(interaction, interaction.channel);
  } catch (e) {
    logger.Error(e);
  }
}