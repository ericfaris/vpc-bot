require('dotenv').config()
var Table = require('easy-table')
var numeral = require('numeral');
const { MessageEmbed } = require('discord.js')

module.exports = {

    createTableRow: (i, t, score, expandedLayout) => {
        t.cell('Rank', i, Table.leftPadder(' '))
        t.cell('User', score.username, Table.rightPadder(' '))
        t.cell('Score', score.score, (val, width) => {
          var str = numeral(val).format('0,0');
          return width ? Table.padLeft(str, width) : str;
        })
        if(expandedLayout) {
          t.cell('+/- Last Score', score.diff, (val, width) => {
            var str = numeral(val).format('0,0');
            return width ? Table.padLeft('(' + (val > 0 ? '+' : '') + str + ')', width) : '(' + (val > 0 ? '+' : '') + str + ')';
          })
          t.cell('Posted', score.posted)
        }
        t.newRow()
    },

    createTableRowTeam: (i, t, team, expandedLayout) => {
      t.cell('Rank', i, Table.leftPadder(' '))
      t.cell('Team', team.teamName, Table.rightPadder(' '))
      t.cell('Score', team.totalScore, (val, width) => {
        var str = numeral(val).format('0,0');
        return width ? Table.padLeft(str, width) : str;
      })
      t.newRow()
    },

    createTableRowForChanges: (i, t, changedScore) => {
      t.cell('Rank', i, Table.leftPadder(' '))
      t.cell('User', changedScore.username, Table.rightPadder(' '))
      t.cell('Score', changedScore.score, (val, width) => {
        var str = numeral(val).format('0,0');
        return width ? Table.padLeft(str, width) : str;
      })
      t.cell('Rank Change', changedScore.rankChange, (val, width) => {
        var str = numeral(val).format('0,0');
        return width ? Table.padLeft('(' + (val > 0 ? '+' : '') + str + ')', width) : '(' + (val > 0 ? '+' : '') + str + ')';
      })
      t.newRow()
    },

    printLeaderboard: (scores, numOfScoresToShow, expandedLayout) => {
      var i = 0;
      var t = new Table;
  
      if(!numOfScoresToShow) {
        numOfScoresToShow = scores.length;
      }
  
      scores.forEach(function (score) {
        i++
        if (i < numOfScoresToShow + 1) {
          module.exports.createTableRow(i, t, score, expandedLayout);
        }
      })
  
      return '`' + t.toString() + '`';
    },

    printTeamSummary: (teams, scores) => {

      module.exports.calculateTeamTotals(teams, scores)

      var i = 0;
      var t = new Table;
      teams.forEach(function (team) {
        i++
        module.exports.createTableRowTeam(i, t, team);
      })
    
      return '`' + t.toString() + '`';
    },

    printTeamLeaderboard: (scores, expandedLayout) => {
      var i = 0;
      var t = new Table;
      scores.forEach(function (score) {
        i++
        module.exports.createTableRow(i, t, score, expandedLayout);
      })
  
      t.total('Score', {
        printer: function (val, width) {
          var str = numeral(val).format('0,0');
          return width ? Table.padLeft(str, width) : str;
        }
      });
  
      return '`' + t.toString() + '`';
    },

    printCombinedLeaderboard: (scores, numOfScoresToShow, teams, showTeamDetails, expandedLayout) => {
      let textTableAsString = '\n';
  
      if (scores.length === 0) {
        return '**NO SCORES CURRENTLY POSTED**\n';
      } else {    
        if(teams && teams.length > 0) {

          textTableAsString += '**Team Summary:**\n';
          textTableAsString += module.exports.printTeamSummary(teams, scores) + '\n';

          if(showTeamDetails) {
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
    
              textTableAsString += '**Team**: ' + team.teamName + '\n';
              textTableAsString += module.exports.printTeamLeaderboard(teamMembersScores, expandedLayout) + '\n';
            })
          }
        }

        textTableAsString += '**Current Leaderboard**:\n';
        textTableAsString += module.exports.printLeaderboard(scores, numOfScoresToShow, expandedLayout) + '\n';
    
        return textTableAsString;  
      }
    },

    printLeaderBoardChanges: (changedScores) => {
      var i = 0;
      var t = new Table;
   
      changedScores.forEach(function (score) {
        i++;
        module.exports.createTableRowForChanges(i, t, score);
      })
  
      return '`' + t.toString() + '`';
    },


    calculateTeamTotals: (teams, scores) => {
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
        team.totalScore = teamMembersScores.reduce((a, b) => a + (b['score'] || 0), 0);
      })
    },
  
    createEmbed: (title, description, color, fields) => {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)

      fields.forEach(field => {
        embed.addField(field.key, field.value)
      });  

      embed.setFooter();

      return embed;
    },

    editCompetitionCornerMessage: async(scores, client, details, teams) => { 
      const channel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      const message = await channel.messages.fetch(process.env.COMPETITION_POST_ID);
  
      message.edit(module.exports.generateBoilerPlateText(scores, teams, details.week, details.period, details.table, details.link));
      message.suppressEmbeds(true);
    },
  
    generateBoilerPlateText: (scores, teams, week, period, table, link) => {
      var bp = '\n\n';
  
      bp += '**COMPETITION SCOREBOARD**\n\n';
      bp += '**Week #**: ' + week + '\n';
      bp += '**Dates**: ' + period + '\n';
      bp += '\n';
      bp += '**Current Table**: ' + table + "\n";
      bp += '**Table Link**: ' + link + "\n";
      bp += '\n';
      bp += module.exports.printCombinedLeaderboard(scores, null, teams, false, false);
      bp += '\n';
      bp += '**All Current & Historical Results**\n';
      bp += 'https://www.iscored.info/?mode=public&user=ED209 \n';
  
      return bp;
    },
}
