const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
var outputHelper = require('../helpers/outputHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: false,
  description: 'Show leaderboard for the Competition Corner',
  callback: ({ args, interaction, channel }) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The show-leaderboard slash command can only be used in the competition-corner channel.';
    } else {
      
      const db = new JSONdb('db.json');

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // sort descending
      scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

      retVal =  module.exports.printAllScores(scores, 3);
    }

    return retVal;
  },

  printIndividualScores: (scores, numOfScoresToShow) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function (score) {
      i++
      if (i < numOfScoresToShow + 1) {
        outputHelper.createTableRow(i, t, score);
      }
    })

    return '`' + t.toString() + '`';
  },

  printTeamScores: (scores) => {
    var i = 0;
    var t = new Table;
    scores.forEach(function (score) {
      i++
      outputHelper.createTableRow(i, t, score);
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

    if (scores.length === 0) {
      return '**NO SCORES CURRENTLY POSTED**\n';
    } else {
      
      textTableAsString += '**Top ' + numOfScoresToShow.toString() + ' Scores**:\n';
      textTableAsString += module.exports.printIndividualScores(scores, numOfScoresToShow) + '\n';
  
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
  },
}