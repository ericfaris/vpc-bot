require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Remove high score by rank from a high score table (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['High Score Corner Mod'],
  minArgs: 1,
  expectedArgs: '<vpsid> <username> <score>',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else {
      const [vpsId, username, score] = args;

      let filter;
      let update;
      let options;

      filter = {authors: {$elemMatch: {vpsId: vpsId}}};
      options = {new: true};
      update = {$pull : {'authors.$[].versions.$[].scores' : {username: username, score: parseInt(score)}}}     

      //save scores to db
      let retVal = await mongoHelper.findOneAndUpdate(filter, update, options, 'tables');

      if (retVal.value) {
        retVal = 'Score removed successfully.';
      } else {
        retVal = 'No score removed. Rank of ' + rank + ' not found.';
      }
    }

    interaction.reply({content: retVal, ephemeral: true});
  },
}