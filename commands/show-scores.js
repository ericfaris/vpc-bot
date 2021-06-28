const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
var printerHelper = require('../helpers/printerHelper')

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Show current scores for the Competition Corner',
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
      
      //return text
      textTableAsString = module.exports.printScores(score);
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

        textTableAsString += module.exports.printScoresWithTotals(teamMembersScores) + '\n\n';
      })
    }

    // return text table string
    return textTableAsString;
  },

  createTableRow: (i, t, score) => {
    t.cell('Rank', numeral(i).format('0,0'))
    t.cell('User', score.username)
    t.cell('Score', numeral(score.score).format('0,0'), printerHelper.noDecimal)
    // t.cell('Posted', score.posted)
    t.newRow()
  },

  printScores: (scores) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function(score) {
      i++
      module.exports.createTableRow(i, t, score);
    })

    return t.toString();
  },

  printScoresWithTotals: (scores) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function(score) {
      i++
      module.exports.createTableRow(i, t, score);
    })

    t.total('Score', printerHelper.noDecimal);

    return t.toString();
  }

}