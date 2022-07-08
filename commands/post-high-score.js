require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const date = require('date-and-time');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { table } = require('console');
const { ObjectId } = require('mongodb');
const { SearchPipelineHelper } = require('../helpers/pipelineHelper');
const { SearchScoreByVpsIdUsernameScorePipelineHelper } = require('../helpers/pipelineHelper');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: 'both',
  aliases: ['high'],
  testOnly: true,
  guildOnly: true,
  description: 'Post a high score.',
  channels: [process.env.HIGH_SCORES_CHANNEL_NAME],
  minArgs: 2,
  expectedArgs: '<score> <tablesearchterm>',
  callback: async ({ args, client, channel, interaction, instance, message, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    let invalidMessage;
    const [score, tableSearchTerm] = args;
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');
    const pipeline = (new SearchPipelineHelper(tableSearchTerm)).pipeline;
    const permissionHelper = new PermissionHelper();

    logger.info(`score: ${score}, tableSearchTerm: ${tableSearchTerm}`);

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, message ?? interaction, module.exports.commandName);
    if (retVal) {message ? message.reply({content: retVal, ephemeral: true}) : interaction.reply({content: retVal, ephemeral: true}); return;}

    try {
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

        const tables = await mongoHelper.aggregate(pipeline, 'tables');

        if (tables.length > 0) {
          const options = [];

          let vpsId;

          tables.forEach(item => {
            
            tableName = item?.tableName;
            authorName = item?.authorName;
            versionNumber = item?.versionNumber;
            vpsId = item.vpsId;
            const scoreAsInt = parseInt(score.replace(/,/g, ''));

            let authorsArray = authorName?.split(', ');
            let firstAuthor = authorsArray?.shift();

            let option = {
              label: `${tableName} (${firstAuthor}... ${versionNumber})`,
              value: `{"vpsId":"${vpsId}","v":"${versionNumber}","u":"${user.username}","s":${scoreAsInt}}`
            };
            options.push(option);
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
                nonce: module.exports.commandName,
                files: [attachment], 
                components: [row],
              }).then(() => {
                message.delete();
              });
            } else {
              invalidMessage = 'No photo attached. Please attach a photo with your high score. This message will be deleted in 10 seconds.'
              
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
              nonce: module.exports.commandName,
            }).then((reply) => {
              setTimeout(() => reply.delete(), instance.delErrMsgCooldown * 1000)
              message.delete();
            });

          } else {
            await interaction.reply({ content: content, ephemeral: true });
          }
        }
      }
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

  highScoreExists: async (data) => {
    let pipeline = (new SearchScoreByVpsIdUsernameScorePipelineHelper(data)).pipeline;
    const tables = await mongoHelper.aggregate(pipeline, 'tables');

    return tables.length > 0 ? true : false
  },

  saveHighScore: async (data, interaction) => {   
    const newHighScore = await mongoHelper.findOneAndUpdate(
      { tableName: data.tableName },
      { $push: { 'authors.$[a].versions.$[v].scores' : {
        '_id': mongoHelper.generateObjectId(),
        'user': interaction.user,
        'username': data.u.replace('`',''),
        'score': data.s,
        'mode': data.mode,
        'postUrl': interaction.message.url,
        'createdAt': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}
      }},
      { returnDocument: 'after',
        arrayFilters: [
          { 'a.vpsId': data.vpsId },
          { 'v.versionNumber': data.versionNumber }
        ]
      },
      'tables'
    );

    return newHighScore.value;
  },

  updateHighScore: async (data, postUrl) => {   
    const updateHighScore = await mongoHelper.findOneAndUpdate(
      { tableName: data.tableName },
      { $set: { 'authors.$[a].versions.$[v].scores.$[s].postUrl' : postUrl }},
      { returnDocument: 'after',
        arrayFilters: [
          { 'a.vpsId': data.vpsId },
          { 'v.versionNumber': data.versionNumber },
          { 's._id': ObjectId(data.scoreId) }
        ]
      },
      'tables'
    );

    return updateHighScore.value;
  }

}
