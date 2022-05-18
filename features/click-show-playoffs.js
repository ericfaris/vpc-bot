const showCommand = require('../commands/show-playoffs');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    if (interaction.customId != 'showPlayoffs') return;
    await showCommand.getPlayoffRoundMatchups(interaction, interaction.channel);        
  });
}