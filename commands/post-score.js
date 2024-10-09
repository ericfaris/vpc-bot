require('dotenv').config()
const path = require('path');
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
const outputHelper = require('../helpers/outputHelper');
const scoreHelper = require('../helpers/scoreHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PermissionHelper } = require('../helpers/permissionHelper');
const Logger = require('../helpers/loggingHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: 'both',
  aliases: ['score'],
  testOnly: true,
  guildOnly: true,
  description: 'Post score for a contest channel.',
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 1,
  expectedArgs: '<score> <posttohighscorechannel>',
  callback: async ({ args, client, interaction, channel, instance, message, user }) => {
    let logger = (new Logger(user)).logger;
    let retVal;
    let invalidMessage;
    let score = args[0];
    const postToHighScoreChannel = args.length > 1 ? args[1] : null;
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');
    const reHighScoreCheck = new RegExp('Rank:\\*\\* [1|2|3|4|5|6|7|8|9|10] of');
    const showPlayoffButton = await mongoHelper.findCurrentPlayoff(channel.name) ?? false;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, message ?? interaction, module.exports.commandName);
    if (retVal) {message ? message.reply({content: retVal, ephemeral: true}) : interaction.reply({content: retVal, ephemeral: true}); return;}

    try {
      const scoreAsInt = parseInt(score.replace(/,/g, ''));

      // invalid parameter message
      if (scoreAsInt == NaN || !re.test(scoreAsInt)) {
        invalidMessage = `The score needs to be a number between 1 and 999999999999999.`
          + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;

        logger.info(invalidMessage);

        if (message) {
          message.reply(invalidMessage).then((reply) => {
            message.delete();
            setTimeout(() => {
              reply.delete();
            }, instance.delErrMsgCooldown * 1000)
          })
        } else {
          interaction.reply({ content: invalidMessage, ephemeral: true });
        }
      } else if (!message) {
        invalidMessage = 'The post-score slash command has been turned off.  Please using the following format to post your score:\n'
          + '`!score 1234567 (an image is REQUIRED as an attachment)`\n\n';
          
        logger.info(invalidMessage);
        interaction.reply({ content: invalidMessage, ephemeral: true });
      } else {
        //parameter is GOOD
        const currentWeek = await mongoHelper.findCurrentWeek(channel.name);

        retVal = await module.exports.saveScore(user, score, currentWeek, client, interaction, message, channel)

        if (message) {
          let content = retVal;
          let attachment = message.attachments?.first();

          if (attachment) {
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('showLeaderboard')
                  .setLabel('Show Leaderboard')
                  .setStyle(ButtonStyle.Primary),
              );
            if(showPlayoffButton){
              row.addComponents(
                new ButtonBuilder()
                  .setCustomId('showPlayoffs')
                  .setLabel('Show Playoffs')
                  .setStyle(ButtonStyle.Primary)
              )
            }
            message.reply({ content: content, files: [attachment], components: [row] }).then((reply) => {
              logger.info('Emitting event to postHighScore');
              client.emit('crossPostHighScore', instance, user, scoreAsInt, attachment,
                currentWeek, process.env.HIGH_SCORES_CHANNEL_ID, `copied from <#${channel.id}>`,
                'just posted a score for', (reHighScoreCheck.test(content) || postToHighScoreChannel?.toLowerCase() === 'y'));
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
          return retVal;
        }
      }
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },

  saveScore: async (user, score, currentWeek, client, interaction, message, channel) => {
    const userName = user.username?.trimRight() || (interaction ? interaction.member.user.username : interaction) || (message ? message.member.user.username : message);
    const avatarUrl = user.displayAvatarURL();
    let previousScore = 0;
    let mode = currentWeek.mode ?? 'default';

    //convert to integer
    const scoreAsInt = parseInt(score.replace(/,/g, ''));

    // get scores from db
    const prevScores = currentWeek.scores ? JSON.parse(JSON.stringify(currentWeek.scores)) : [];
    const scores = currentWeek.scores ? JSON.parse(JSON.stringify(currentWeek.scores)) : [];

    //search for existing score
    const existing = scores.find(x => x.username === userName);

    // update or add score
    if (existing) {
      previousScore = existing.score;
      existing.score = scoreAsInt;
      existing.diff = scoreAsInt - previousScore;
      existing.mode = mode;
      existing.posted = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss');
      existing.userAvatarUrl = avatarUrl;
    } else {
      scores.push({ 'username': userName.replace('`', ''), 'userAvatarUrl': avatarUrl, 'score': scoreAsInt, 'diff': scoreAsInt, 
        'mode': mode, 'posted': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss') });
    }

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    scoreHelper.modifyPoints(scores);
    const changeInRank = scoreHelper.getRankChange(userName, prevScores, scores);
    const currentRank = scoreHelper.getCurrentRankText(userName, scores);

    //save scores to db
    await mongoHelper.updateOne({ channelName: channel.name, isArchived: false }, { $set: { scores: scores } }, null, 'weeks');

    if (channel.name === process.env.COMPETITION_CHANNEL_NAME) {
      //post to competition channel pinned message
      await outputHelper.editWeeklyCompetitionCornerMessage(scores, client, currentWeek, currentWeek.teams);
    }

    let scoreDiff = scoreAsInt - previousScore;

    // return text table string
    return '**NEW WEEKLY SCORE POSTED:**\n'
      + `**User:** <@${user.id}>\n`
      + `**Table:** ${currentWeek.table}\n`
      + (mode != 'default' ? `**Mode:** ${mode}\n` : '')
      + `**Score:** ${numeral(scoreAsInt).format('0,0')} (${(scoreDiff >= 0 ? '+' : '')} ${numeral(scoreAsInt - previousScore).format(0, 0)})\n`
      + `**Rank:** ${currentRank} (${(changeInRank >= 0 ? '+' + changeInRank : changeInRank)})`;
  },
}