require('dotenv').config()
const path = require('path');
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const RandomOrg = require('random-org');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Show leaderboard for the channel.',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  callback: async ({ channel, interaction, client }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
    } else {
      return module.exports.runRaffleForCurrentWeek(interaction, channel);
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
    raffleList += `**(${retNumber}) ` + currentWeek.scores[retNumber].username + '**\n\n';
    raffleList += 'Please see @MajorFrenchy for your prize...'

    return raffleList;
  },

}