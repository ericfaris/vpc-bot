require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Remove high score by rank from a high score table (MANAGE_GUILD)',
  roles: [process.env.BOT_HIGH_SCORE_ADMIN_ROLE_NAME],
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  minArgs: 3,
  expectedArgs: '<vpsid> <username> <score>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;
    const permissionHelper2 = new PermissionHelper2();

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const [vpsId, username, score] = args;

      let filter;
      let update;
      let options;

      filter = {authors: {$elemMatch: {vpsId: vpsId}}};
      options = {new: true};
      update = {$pull : {'authors.$[].versions.$[].scores' : {username: username, score: parseInt(score)}}}     

      //save scores to db
      let response = await mongoHelper.findOneAndUpdate(filter, update, options, 'tables');

      if (response.value) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Score not found.';
      }
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}