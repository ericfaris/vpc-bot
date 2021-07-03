const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
var outputHelper = require('../helpers/outputHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  description: 'Show current score for the Competition Corner',
  callback: ({ args, interaction }) => {
    const db = new JSONdb('db.json');
    const username = interaction.member.user.username;
    var t = new Table;
    var retVal;

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

    const score = scores.find(x => x.username === username);
    
    if (score) {
      score.rank = scores.findIndex(x => x.username === username) + 1;
      const numOfScores = scores.length;

      outputHelper.createTableRow(score.rank.toString() + ' of ' + numOfScores.toString(), t, score);

      retVal = '`' + t.toString() + '`';
    } else {
      retVal = 'No score found for ' + username;
    }

    return retVal;
  },
}