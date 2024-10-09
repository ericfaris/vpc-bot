const showPlayoffsCommand = require('../../commands/show-playoffs');

module.exports = async (interaction, instance) => {
  if (interaction.customId != 'showPlayoffs') return;
  await showPlayoffsCommand.getPlayoffRoundMatchups(interaction, interaction.channel);
}