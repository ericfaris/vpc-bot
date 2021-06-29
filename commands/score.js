const JSONdb = require('simple-json-db');
const date = require('date-and-time');
var Table = require('easy-table');
var numeral = require('numeral');
var showScores = require('./show-scores');
const COMPETITION_CHANNEL_ID = '854595057382457366';
const COMPETITION_POST_ID = '859279189806415913';

module.exports = {
  slash: true,
  testOnly: true,
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
    return 'Score saved and posted.'
  },

  editChannel: async(scores, client) => {
    const channel = await client.channels.fetch(COMPETITION_CHANNEL_ID);
    const message = await channel.messages.fetch(COMPETITION_POST_ID);

    message.edit(showScores.printScores(scores, 3));
  },

  //TODO: GENERATE COMPETITION POST BOILERPLATE

}