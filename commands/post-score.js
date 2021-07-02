const JSONdb = require('simple-json-db');
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
var showScores = require('./show-scores');
require('dotenv').config()

module.exports = {
  slash: true,
  testOnly: false,
  description: 'Post score for the Competition Corner',
  minArgs: 1,
  expectedArgs: '<score>',
  callback: async ({args, client, interaction}) => {
    const db = new JSONdb('db.json');
    const [score] = args;
    const userName = interaction.member.user.username;

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    //search for existing score
    const existing = scores.find(x => x.username === userName);

    //convert to integer
    const scoreAsInt = parseInt(score);

    // update or add score
    if (existing) {
      existing.score = scoreAsInt;
      existing.posted = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss');
    } else {
      scores.push({'username': userName, 'score': scoreAsInt, 'posted': date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')});
    }

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)

    //save scores to db
    db.set('scores', JSON.stringify(scores));
    
    //post to competition channel pinned message
    await module.exports.editChannel(scores, client);

    // return text table string
    return userName + ' posted a score of ' + numeral(scoreAsInt).format('0,0');
  },

  editChannel: async(scores, client) => {
    const db = new JSONdb('db.json');

    // get details from db
    const details = db.get('details') ? JSON.parse(db.get('details')) : null;

    const channel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
    const message = await channel.messages.fetch(process.env.COMPETITION_POST_ID);

    message.edit(module.exports.generateBoilerPlateText(scores, details.period, details.table, details.link));
  },

  generateBoilerPlateText: (scores, period, table, link) => {
    var bp = '\n';

    bp += '**COMPETITION SCOREBOARD**\n';
    bp += period + '\n';
    bp += '\n';
    bp += '**Current Table**: ' + table + "\n";
    bp += '**Table Link**: ' + link + "\n";
    bp += '\n';
    bp += showScores.printAllScores(scores, 3);
    bp += '\n';
    bp += '**All Current & Historical Results**\n';
    bp += 'https://www.iscored.info/?mode=public&user=ED209 \n';

    return bp;
  }
}