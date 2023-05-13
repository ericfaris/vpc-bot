const showLeaderboardCommand = require('../commands/show-leaderboard');
const Logger = require('../helpers/loggingHelper');

module.exports = (client) => {
  try {
    client.on('interactionCreate', async interaction => {
      if (interaction.customId != 'showLeaderboard') return;
      await showLeaderboardCommand.getLeaderboard(interaction, interaction.channel);        
    });
  } catch(e) {
    Logger.Error(e);
  }
}