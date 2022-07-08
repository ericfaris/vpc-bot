require('dotenv').config()
const path = require('path');
var postScore = require('./post-score');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Edit current contest score.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({ args, channel, client, interaction, message, instance }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const [username, score] = args;
      const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
      const user = client.users.cache.find(user => user.username == username) || {username: username};
      retVal = await postScore.saveScore(user, score, currentWeek, client, interaction, message, channel);
      interaction.reply({content: retVal, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}
