require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'Remove score by rank from Competition Corner (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 1,
  expectedArgs: '<rank>',
  callback: async ({args, channel, interaction, client, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      let rank = args[0];

      //get current week
      const currentWeek = await mongoHelper.findCurrentWeek('vpc', 'weeks');

      //remove score based on rank/index
      var retArray = currentWeek.scores.splice(rank-1, 1);

      //save scores to db
      await mongoHelper.updateOne({isArchived: false}, {$set: {scores: currentWeek.scores}}, 'vpc', 'weeks');

      if(retArray.length > 0) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Rank of ' + rank + ' not found.';
      }
    }

    return retVal;
  },
}