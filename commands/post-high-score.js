require('dotenv').config()
const path = require('path');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: 'both',
  aliases: ['high'],
  testOnly: true,
  guildOnly: true,
  hidden: true,
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  description: 'Post a high score (MANAGE_GUILD)',
  minArgs: 2,
  expectedArgs: '<score> <tablesearchterm>',
  callback: async ({ args, client, channel, interaction, instance, message, user }) => {
    let retVal;
    let commandName = path.basename(__filename).split('.')[0];

    // if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
    //   console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
    //   responseHelper.deleteOriginalMessage(interaction, instance.del);
    //   return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    // }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const [score, tableSearchTerm] = args;

      const tables = (await mongoHelper.find({tableName:{$regex:'.*' + tableSearchTerm + '.*', $options: 'i'}}, 'tables'))
        .sort((a, b) => a.tableName - b.tableName);

      const options = [];

      let tableName;
      let authorName;
      let versionNumber;

      tables.forEach(table => {
        tableName = table.tableName;
        table.authors.sort((a,b) => b.author - a.author).forEach(author => {
          authorName = author.author;
          author.versions.sort((a,b) => b.version - a.version).forEach(version => {
            versionNumber = version.version;
            let option = {
              label: `${tableName} (${authorName} ${versionNumber})`,
              value: `{"u":"${user.username}","s":${score},"t":"${tableName}","a":"${authorName}","v":"${versionNumber}"}`
            };
            options.push(option);
          })
        })
      });

      const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(options),
        );

      if (message) {
        let attachment = message.attachments?.first();
        let content = 'Which table do you want to post this high score?';

        message.reply({ 
          content: content, 
          nonce: commandName,
          files: [attachment], 
          components: [row], 
          ephemeral: true
        }).then(() => {
          message.delete();
        });

      } else {
        await interaction.reply({ content: content, components: [row], ephemeral: true });
      }
    }
  },

  saveHighScore: async (highScoreObject) => {
    console.log(highScoreObject);
  },
}
