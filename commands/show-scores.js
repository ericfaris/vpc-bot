const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Show current scores for the Competition Corner',
  callback: ({ args, interaction }) => {
    const db = new JSONdb('db.json');

    // get scores from db
    const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

    // sort descending
    scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

    return module.exports.printAllScores(scores, 3);
  },

  createTableRow: (i, t, score) => {
    t.cell('Rank', i, Table.leftPadder(' '))
    t.cell('User', score.username, Table.rightPadder(' '))
    t.cell('Score', score.score, (val, width) => {
      var str = numeral(val).format('0,0');
      return width ? Table.padLeft(str, width) : str;
    })
    t.cell('Posted', score.posted)
    t.newRow()
  },

  printIndividualScores: (scores, numOfScoresToShow) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function (score) {
      i++
      if (i < numOfScoresToShow + 1) {
        module.exports.createTableRow(i, t, score);
      }
    })

    return '`' + t.toString() + '`';
  },

  printTeamScores: (scores) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function (score) {
      i++
      module.exports.createTableRow(i, t, score);
    })

    t.total('Score', {
      printer: function (val, width) {
        var str = numeral(val).format('0,0');
        return width ? Table.padLeft(str, width) : str;
      }
    });

    return '`' + t.toString() + '`';
  },

  printAllScores: (scores, numOfScoresToShow) => {
    const db = new JSONdb('db.json');
    const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

    let textTableAsString = '';

    if (scores.length === 0) return 'No scores currently posted.';

    textTableAsString += '**Top 3 Scores**:\n';
    textTableAsString += module.exports.printIndividualScores(scores, numOfScoresToShow) + '\n\n';

    if(teams && teams.length > 0) {
      teams.forEach((team) => {
        const teamMembersScores = [];
        team.members.forEach((member) => {
          const foundMember = scores.find(x => x.username === member);
          if (foundMember) {
            teamMembersScores.push(foundMember);
          } else {
            teamMembersScores.push(
              {
                'username': member,
                'score': 0,
                'posted': ''
              });
          }
        })

        // sort descending
        teamMembersScores.sort((a, b) => (a.score < b.score) ? 1 : -1);

        textTableAsString += '**Team: ' + team.teamName + '**\n';
        textTableAsString += module.exports.printTeamScores(teamMembersScores) + '\n';
      })
    }

    return textTableAsString;
  }
}