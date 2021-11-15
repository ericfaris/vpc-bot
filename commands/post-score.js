require('dotenv').config()
const path = require('path');
const moment = require('moment');
const { MessageEmbed } = require('discord.js')
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
const outputHelper = require('../helpers/outputHelper');
const responseHelper = require('../helpers/responseHelper');
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
  expectedArgs: '<score>',
  callback: async ({ args, client, interaction, channel, instance, message, user }) => {
    let retVal;
    let invalidMessage;
    let score = args[0];
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      invalidMessage = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;

      if (message) {
        message.reply(invalidMessage).then((reply) => {
          message.delete();
          setTimeout(() => {
            reply.delete();
          }, instance.del * 1000)
        })
      } else {
        responseHelper.deleteOriginalMessage(interaction, instance.del);
        return invalidMessage;
      }
    } else {
      //parameter is BAD

      //convert to integer
      const scoreAsInt = parseInt(score.replace(/,/g, ''));

      // invalid parameter message
      if (scoreAsInt == NaN || !re.test(scoreAsInt)) {
        invalidMessage = `The score needs to be a number between 1 and 999999999999999.`
          + ` This message will be deleted in ${instance.del} seconds.`;

        if (message) {
          message.reply(invalidMessage).then((reply) => {
            message.delete();
            setTimeout(() => {
              reply.delete();
            }, instance.del * 1000)
          })
        } else {
          responseHelper.deleteOriginalMessage(interaction, instance.del);
          return invalidMessage;
        }
      } else if (!message) {
        invalidMessage = 'The post-score slash command has been turned off.  Please using the following format to post your score:\n'
          + '`!score 1234567 (an image should also be posted as an attachment)`\n\n'
          + 'This message will be deleted in 60 seconds.';

        responseHelper.deleteOriginalMessage(interaction, 60);
        return invalidMessage;
      } else {
        //parameter is GOOD
        const currentWeek = await mongoHelper.findCurrentWeek('weeks');
        const periodEnd = currentWeek ? new Date(currentWeek.periodEnd) : null;
        const utcDeadline = moment.utc(periodEnd).add(1, 'days').add(7, 'hours');

        //checking for deadline
        if (periodEnd && moment.utc().isSameOrAfter(utcDeadline)) {

          invalidMessage = `You are trying to post a score after the deadline of 12:00 AM PST. This message will be deleted in ${instance.del} seconds.`;

          if (message) {
            message.reply(invalidMessage).then((reply) => {
              message.delete();
              setTimeout(() => {
                reply.delete();
              }, instance.del * 1000)
            })
          } else {
            responseHelper.deleteOriginalMessage(interaction, instance.del);
            return invalidMessage;
          }

        } else {
          //before deadline

          retVal = await module.exports.saveScore(null, score, currentWeek, client, interaction, message)

          if (message) {
            let attachment = message.attachments?.first();
            message.reply({content: '@' + user.username + ', ' + retVal, files: [attachment]}).then(() => {
              message.delete();
            });
          } else {
            return retVal;
          }
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
      scores.push({ 'username': userName, 'score': scoreAsInt, 'diff': scoreAsInt, 'posted': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss') });
    }

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    scoreHelper.modifyPoints(scores);
    const changeInRank = scoreHelper.getRankChange(userName, prevScores, scores);
    const currentRank = scoreHelper.getCurrentRankText(userName, scores);

    //save scores to db
    await mongoHelper.updateOne({ isArchived: false }, { $set: { scores: scores } }, 'weeks');

    //post to competition channel pinned message
    await outputHelper.editWeeklyCompetitionCornerMessage(scores, client, currentWeek, currentWeek.teams);

    let scoreDiff = scoreAsInt - previousScore;

    // return text table string
    return (message ? '' : '**@' + userName + '**,') + ' posted a new score:\n'
      + '**' + numeral(scoreAsInt).format('0,0') + '** (' + (scoreDiff >= 0 ? '+' : '') + numeral(scoreAsInt - previousScore).format(0, 0) + ')\n'
      + '**Rank ' + currentRank + '** (' + (changeInRank >= 0 ? '+' + changeInRank : changeInRank) + ')';
  },
}