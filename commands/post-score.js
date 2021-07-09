require('dotenv').config()
const { MessageEmbed } = require('discord.js')
const JSONdb = require('simple-json-db');
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
const outputHelper = require('../helpers/outputHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: false,
  description: 'Post score for the Competition Corner',
  minArgs: 1,
  expectedArgs: '<score>',
  callback: async ({args, client, interaction, channel, instance}) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The post-score slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      retVal = module.exports.saveScore(null, args[0], client, interaction)
    }

    return retVal;
  },

  saveScore: async(username, score, client, interaction) => { 
    const db = new JSONdb('db.json');
    const userName = username || interaction.member.user.username;
    const user = await client.users.fetch(interaction.member.user.id);
    const re = new RegExp('^([1-9]|[1-9][0-9]{1,14})$');
    let previousScore = 0;

    //convert to integer
    const scoreAsInt = parseInt(score.replace(/,/g, ''));

    if (scoreAsInt == NaN || !re.test(scoreAsInt)) {
      return 'The score needs to be a number between 1 and 999999999999999';
    }

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    //search for existing score
    const existing = scores.find(x => x.username === userName);

    // update or add score
    if (existing) {
      previousScore = existing.score;
      existing.score = scoreAsInt;
      existing.diff = scoreAsInt-previousScore;
      existing.posted = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss');
    } else {
      scores.push({'username': userName, 'score': scoreAsInt, 'diff': scoreAsInt, 'posted': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')});
    }

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)

    //save scores to db
    db.set('scores', JSON.stringify(scores));

    // get details from db
    const details = db.get('details') ? JSON.parse(db.get('details')) : null;

    // get teams from db
    const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

    //post to competition channel pinned message
    await outputHelper.editCompetitionCornerMessage(scores, client, details, teams);

    const embed = new MessageEmbed()
      .setAuthor(userName, user.displayAvatarURL())
      // .setImage(user.displayAvatarURL())
      .setTitle(userName + ' posted a new score:')
      .addField('New Score', numeral(scoreAsInt).format('0,0') + ' (+' + numeral(scoreAsInt-previousScore).format(0,0) + ')')

    // return text table string
    //return userName + ' posted a score of ' + numeral(scoreAsInt).format('0,0') + ' (+' + numeral(scoreAsInt-previousScore).format(0,0) + ')';
    
    return embed;
  },

}