require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  roles: ['Competition Corner Mod'],
  hidden: true,
  description: 'Create new message for Competition Corner (MANAGE_GUILD)',
  callback: async ({ client, channel, interaction, instance, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    let ephemeral = false;

    const guildOnly = await instance.slashCommands.get(channel.guild.id);
    guildOnly.forEach(element => {
      console.log(`${element.id} ${element.name}`);
    });

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.`)
      retVal = `${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.;`
      ephemeral = true;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
      ephemeral = true;
    } else {
      try{
        retVal = 'Message Created Successfully.';
      } catch(error) {
        logger.error(error.message);
        throw error;
      }
    }

    interaction.reply({content: retVal, ephemeral: ephemeral});
  },
}
