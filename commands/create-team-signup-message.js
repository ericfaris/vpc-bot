require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

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
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      const strText = `**Team Competition Signup for Next Week (${period})**\n\n` +
        `If you are playing next week, **${period}**, please add and/or click on the "thumbs up" emoji below ` +
        '(**add the thumbs up emoji if you are the first person to signup**). ' +
        'We will keep the signups open until 11:59pm PST on Sunday night.  We will then assign somewhat random but fair teams.';
      compChannel.send(strText);

      responseHelper.deleteOriginalMessage(interaction, 0);
      retVal = 'Message created successfully.'
    }

    return retVal;
  },
}
