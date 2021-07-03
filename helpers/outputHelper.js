var Table = require('easy-table')
var numeral = require('numeral');

module.exports = {

    createTableRow: (i, t, score) => {
        t.cell('Rank', i, Table.leftPadder(' '))
        t.cell('User', score.username, Table.rightPadder(' '))
        t.cell('Score', score.score, (val, width) => {
          var str = numeral(val).format('0,0');
          return width ? Table.padLeft(str, width) : str;
        })
        t.cell('Diff', score.diff, (val, width) => {
          var str = numeral(val).format('0,0');
          return width ? Table.padLeft('(+' + str + ')', width) : '(+' + str + ')';
        })
        t.cell('Posted', score.posted)
        t.newRow()
      },
    
}