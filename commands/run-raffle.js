require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');
const { PermissionHelper2 } = require('../helpers/permissionHelper2');
const RandomOrg = require('random-org');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Run raffle for the current contest.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  callback: async ({ channel, interaction, client }) => {
    let retVal;
    const permissionHelper2 = new PermissionHelper2();

    // Check if the User has a valid Role
    retVal = await permissionHelper2.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper2.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      retVal = module.exports.runRaffleForCurrentWeek(interaction, channel);
      return retVal;
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

  runRaffleForCurrentWeek : async (interaction, channel) => {
    const currentWeek = await mongoHelper.findCurrentWeek(channel.name);
    let raffleList = await outputHelper.printWeeklyLeaderboard(currentWeek.scores, null, false, false);
    let particpantCount = currentWeek.scores.length;
    
    var random = new RandomOrg({ apiKey: process.env.RANDOMORG_API_KEY });
    retNumber = (await random.generateIntegers({ min: 1, max: particpantCount + 1, n: 1 })).random.data[0]-1;

    raffleList += '\n\n';
    raffleList += 'and the winner is......\n';
    raffleList += `**(${retNumber+1}) ` + currentWeek.scores[retNumber].username + '**\n\n';

    return raffleList;
  },
}