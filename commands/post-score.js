require('dotenv').config()
const path = require('path');
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
const outputHelper = require('../helpers/outputHelper');
const scoreHelper = require('../helpers/scoreHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: 'both',
  aliases: ['score'],
  testOnly: true,
  guildOnly: true,
  description: 'Post score for the Competition Corner',
  minArgs: 1,
  expectedArgs: '<score> <posttohighscorechannel>',
  callback: async ({ args, client, interaction, channel, instance, message, user }) => {
    let retVal;
    let invalidMessage;
    let score = args[0];
    const postToHighScoreChannel = args.length > 1 ? args[1] : null;
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');
    const reHighScoreCheck = new RegExp('Rank: [1|2|3|4|5] of');

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      invalidMessage = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;

      if (message) {
        message.reply(invalidMessage).then((reply) => {
          message.delete();
          setTimeout(() => {
            reply.delete();
          }, instance.delErrMsgCooldown * 1000)
        })
      } else {
        retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`;
        interaction.reply({ content: retVal, ephemeral: true });
      };
    } else {
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
          interaction.reply({ content: invalidMessage, ephemeral: true });
        }
      } else if (!message) {
        invalidMessage = 'The post-score slash command has been turned off.  Please using the following format to post your score:\n'
          + '`!score 1234567 (an image is REQUIRED as an attachment)`\n\n';
          
        interaction.reply({ content: invalidMessage, ephemeral: true });
      } else {
        //parameter is GOOD
        const currentWeek = await mongoHelper.findCurrentWeek('weeks');

        retVal = await module.exports.saveScore(null, score, currentWeek, client, interaction, message)

        if (message) {
          let content = `<@${user.id}>, ${retVal}`;
          let attachment = message.attachments?.first();

          if (attachment) {
            message.reply({ content: content, files: [attachment] }).then(() => {
              //post this same score to the #high-score-corner channel
              if (reHighScoreCheck.test(content) || postToHighScoreChannel.toLowerCase() === 'y') {
                client.emit('postHighScore', user, scoreAsInt, attachment,
                  currentWeek, process.env.HIGH_SCORES_CHANNEL_ID, `COPIED FROM <#${process.env.COMPETITION_CHANNEL_ID}>`,
                  'just posted a score for');
              }
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
    }
  },

  saveScore: async (username, score, currentWeek, client, interaction, message) => {
    const userName = username?.trimRight() || (interaction ? interaction.member.user.username : interaction) || (message ? message.member.user.username : message);
    let previousScore = 0;

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
      existing.posted = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss');
    } else {
      scores.push({ 'username': userName.replace('`', ''), 'score': scoreAsInt, 'diff': scoreAsInt, 'posted': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss') });
    }

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    scoreHelper.modifyPoints(scores);
    const changeInRank = scoreHelper.getRankChange(userName, prevScores, scores);
    const currentRank = scoreHelper.getCurrentRankText(userName, scores);

    //save scores to db
    await mongoHelper.updateOne({ isArchived: false }, { $set: { scores: scores } }, null, 'weeks');

    //post to competition channel pinned message
    await outputHelper.editWeeklyCompetitionCornerMessage(scores, client, currentWeek, currentWeek.teams);

    let scoreDiff = scoreAsInt - previousScore;

    // return text table string
    return (message ? '' : `**@' ${userName} + '**,`) + ' posted a new score:\n'
      + `**Score:** ${numeral(scoreAsInt).format('0,0')} (${(scoreDiff >= 0 ? '+' : '')} ${numeral(scoreAsInt - previousScore).format(0, 0)})\n`
      + `**Rank:** ${currentRank} (${(changeInRank >= 0 ? '+' + changeInRank : changeInRank)})`;
  },
}