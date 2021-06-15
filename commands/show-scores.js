const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Bot for showing scores for the Competition Corner',
  callback: ({args, interaction}) => {
    const db = new JSONdb('db.json');
    const t = new Table;

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    if (scores.length === 0) return 'No scores to show.';

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
   
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