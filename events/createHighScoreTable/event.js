const command = require('../../commands/create-high-score-table');

module.exports = async (instance, vpsId, interaction) => {
    var args = [vpsId];
    var client = instance.client;
    var channel = interaction.channel;
    var user = interaction.user;
    var message = interaction?.message;

    var retVal = await command.callback(({ args, client, channel, interaction, instance, user, message}));

    if(!interaction.replied){
        interaction.reply({content: retVal, ephemeral: false});
      } else {
        interaction.followUp('**Trying to create new high score table:**  ' + retVal);
    }
}