require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const date = require('date-and-time');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { table } = require('console');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: 'both',
  aliases: ['high'],
  testOnly: true,
  guildOnly: true,
  description: 'Post a high score (MANAGE_GUILD)',
  minArgs: 2,
  expectedArgs: '<score> <tablesearchterm>',
  callback: async ({ args, client, channel, interaction, instance, message, user }) => {
    let logger = (new Logger(user)).logger;
    logger.info('in callback');
    let retVal;
    let invalidMessage;
    let commandName = path.basename(__filename).split('.')[0];
    const [score, tableSearchTerm] = args;
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');

    logger.info(`score: ${score}, tableSearchTerm: ${tableSearchTerm}`);

    if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
      invalidMessage = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;

      if (message) {
        message.reply(invalidMessage).then((reply) => {
          message.delete();
          setTimeout(() => {
            reply.delete();
          }, instance.delErrMsgCooldown * 1000)
        })
      } else {
        responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
        return invalidMessage;
      }
    } else {
      //parameter is BAD

      //convert to integer
      const scoreAsInt = parseInt(score.replace(/,/g, ''));

      // invalid parameter message
      if (scoreAsInt == NaN || !re.test(scoreAsInt)) {
        invalidMessage = `The score needs to be a number between 1 and 999999999999999.`
          + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;

        if (message) {
          message.reply(invalidMessage).then((reply) => {
            message.delete();
            setTimeout(() => {
              reply.delete();
            }, instance.delErrMsgCooldown * 1000)
          })
        } else {
          responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
          return invalidMessage;
        }
      } else if (!message) {
        invalidMessage = 'The post-high-score slash command has been turned off.  Please using the following format to post your high score:\n'
          + '`!high <score> <tablesearchterm> (an image is required to be posted as an attachment)`\n\n'
          + 'This message will be deleted in 60 seconds.';

        responseHelper.deleteOriginalMessage(interaction, 60);
        return invalidMessage;
      } else {
        const tables = (await mongoHelper.find({tableName:{$regex:'.*' + tableSearchTerm + '.*', $options: 'i'}}, 'tables'))
          .sort((a, b) => a.tableName - b.tableName);

        if (tables.length > 0) {
          const options = [];

          let tableName;
          let authorName;
          let versionNumber;

          tables.forEach(table => {
            tableName = table.tableName;
            table.authors.sort((a,b) => b.authorName - a.authorName).forEach(author => {
              authorName = author.authorName;
              author.versions.sort((a,b) => b.version - a.version).forEach(version => {
                versionNumber = version.version;
                const scoreAsInt = parseInt(score.replace(/,/g, ''));
                let option = {
                  label: `${tableName} (${authorName} ${versionNumber})`,
                  value: `{"u":"${user.username}","s":"${scoreAsInt}","t":"${tableName}","a":"${authorName}","v":"${versionNumber}"}`
                };
                options.push(option);
              })
            })
          });
          logger.info(`found ${tables.length} tables.`)

          const row = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Please select table for high score...')
                .addOptions(options),
            );
          logger.info('created row.')

          if (message) {
            let attachment = message.attachments?.first();
            logger.info(`attachment found.  attachment: ${JSON.stringify(attachment)}`)

            if (attachment) {
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
              invalidMessage = 'No photo attached.  Please attach a photo with your high score.  This message will be deleted in 10 seconds.'
              
              message.reply(invalidMessage).then((reply) => {
                message.delete();
                setTimeout(() => {
                  reply.delete();
                }, instance.delErrMsgCooldown * 1000)
              })    
            }
          } else {
            await interaction.reply({ content: content, components: [row], ephemeral: true });
          }
        } else {
          logger.info('No tables found.');

          if (message) {
            let content = `No high score tables were found using "${tableSearchTerm}".` +
              `  Try posting high score again using a different table search term.  This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;

            message.reply({ 
              content: content, 
              nonce: commandName,
              ephemeral: true
            }).then((reply) => {
              setTimeout(() => reply.delete(), instance.delErrMsgCooldown * 1000)
              message.delete();
            });

          } else {
            await interaction.reply({ content: content, ephemeral: true });
          }
        }
      }
    }
  },

  saveHighScore: async (data, interaction) => {
    await mongoHelper.updateOne(
      { tableName: data.t },
      { $push: { 'authors.$[a].versions.$[v].scores' : {
        'username': data.u,
        'score': data.s,
        'postUrl': interaction.message.url,
        'createdAt': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}
      }}, 
      { arrayFilters: [
          { 'a.authorName': data.a },
          { 'v.version': data.v }
        ]},
      'tables'
    );
  },
}
