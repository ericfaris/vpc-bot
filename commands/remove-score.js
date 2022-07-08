require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const removeHighScoreCommand = require('../commands/remove-high-score');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Remove score by rank from current contest.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 1,
  expectedArgs: '<rank>',
  callback: async ({ args, channel, interaction, client, instance, user, message}) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      let rank = args[0];

      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
  
      //retrieve score for rank
      var username = currentWeek.scores[rank-1].username;
      var score = currentWeek.scores[rank-1].score;

      //remove score based on rank/index
      var retArray = currentWeek.scores.splice(rank - 1, 1);

      //save scores to db
      await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { scores: currentWeek.scores } }, null, 'weeks');
      
      //removing associated high score
      await removeHighScoreCommand.callback( {args: [currentWeek.vpsId, username, score], client: client, channel: channel ?? interaction.channel, interaction: interaction, instance: instance, message: message, user: user});

      if (retArray.length > 0) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Rank of ' + rank + ' not found.';
      }
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}