const JSONdb = require('simple-json-db');
const date = require('date-and-time');
var Table = require('easy-table')
var numeral = require('numeral');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Bot for posting scores for the Competition Corner',
  minArgs: 1,
  expectedArgs: '<score>',
  callback: ({args, interaction}) => {
    const db = new JSONdb('db.json');
    const t = new Table;
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
    
    // create text table
    var i = 0;
    scores.forEach(function(score) {
      i++
      t.cell('Rank   ', i, Table.number(0))
      t.cell('User    ', '**@' + score.username + '**', Table.rightPadder(' '))
      t.cell('Score   ', numeral(score.score).format('0,0'), Table.leftPadder(' '))
      t.cell('Posted   ', score.posted, Table.leftPadder(' '))
      t.newRow()
    })
    
    // return text table string
    return t.toString();
  },
}