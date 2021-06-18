const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Bot for showing scores for the Competition Corner',
  callback: ({args, interaction}) => {
    const db = new JSONdb('db.json');
    let textTableAsString = '';

    // get teams from db
    const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    if (scores.length === 0) return 'No scores to show.';

    if (!teams || teams.length === 0) {
      // sort descending
      scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    
      // create text table
      var i = 0;
      var t = new Table;
      scores.forEach(function(score) {
        i++
        t.cell('Rank   ', i, Table.number(0))
        t.cell('User    ', '**@' + score.username + '**', Table.rightPadder(' '))
        t.cell('Score', numeral(score.score).format('0,0'), Table.leftPadder(' '))
        t.cell('Posted   ', score.posted, Table.leftPadder(' '))
        t.newRow()
      })

      textTableAsString = t.toString();
    } else {
      teams.forEach((team) => {
        const teamMembersScores= [];
        team.members.forEach((member) => {
          const foundMember = scores.find(x => x.username === member);
          if (foundMember) {
            teamMembersScores.push(foundMember);
          } else {
            teamMembersScores.push(
              {'username': member, 
               'score': 0, 
               'posted': ''
              });
          }
        })

        // sort descending
        teamMembersScores.sort((a, b) => (a.score < b.score) ? 1 : -1)
      
        textTableAsString += 'Team: ' + team.teamName + '\n\n';

        // create text table
        var i = 0;
        var t = new Table;
        teamMembersScores.forEach(function(score) {
          i++
          t.cell('Rank   ', i, Table.number(0))
          t.cell('User    ', '**@' + score.username + '**', Table.rightPadder(' '))
          t.cell('Score', numeral(score.score).format('0,0'), Table.leftPadder(' '))
          t.cell('Posted   ', score.posted, Table.leftPadder(' '))
          t.newRow()
        })

        t.total('Score');

        textTableAsString += t.toString() + '\n\n\n\n';
      })
    }

    // return text table string
    return textTableAsString;
  },
}