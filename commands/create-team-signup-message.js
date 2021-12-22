require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  description: 'Create team signup message for Competition Corner (MANAGE_GUILD)',
  minArgs: 1,
  expectedArgs: '<period>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;
    const [period] = args;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      retVal = `The ${module.exports.commandName} slash command can only be executed by an admin.`;
    } else if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
    } else {
      retVal = `**Team Competition Signup for Next Week (${period})**\n\n` +
        `If you are playing next week, **${period}**, please add and/or click on the "thumbs up" emoji below ` +
        '(**add the thumbs up emoji if you are the first person to signup**). ' +
        'We will keep the signups open until 11:59pm PST on Sunday night.  We will then assign somewhat random but fair teams.';
    }

    interaction.reply({content: retVal});
  },
}
