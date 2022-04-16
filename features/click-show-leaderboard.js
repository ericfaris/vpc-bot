const showLeaderboardCommand = require('../commands/show-leaderboard');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.customId != 'showLeaderboard') return;
    await showLeaderboardCommand.getLeaderboard(interaction, interaction.channel);        
  });
}