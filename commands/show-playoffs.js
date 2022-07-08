require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PlayoffHelper } = require('../helpers/playoffHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show playoffs for the channel.',
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  callback: async ({ channel, interaction}) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);

      if(currentPlayoff) {
        return module.exports.getPlayoffRoundMatchups(interaction, channel);
      } else {
        interaction.reply({content: 'No playoffs found.', ephemeral: false});
      }
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

  getPlayoffRoundMatchups : async (interaction, channel) => {
    let playoffHelper = new PlayoffHelper();
    const currentPlayoff = await mongoHelper.findCurrentPlayoff(channel.name);
    const currentPlayoffRound = await mongoHelper.findCurrentPlayoffRound(channel.name);
    const currentWeek = await  mongoHelper.findCurrentWeek(channel.name);

    const games = playoffHelper.getCurrentPlayoffMatchups(currentWeek, currentPlayoff, currentPlayoffRound);
    return await responseHelper.showPlayoffMatchups(games, interaction, true);
  }
}