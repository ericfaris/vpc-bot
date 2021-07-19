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

    printLeaderboard: (scores, numOfScoresToShow, expandedLayout) => {
      var strText = '**Leaderboard:**\n';

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
  
      strText += '`' + t.toString() + '`';

      return strText;
    },

    printTeamSummary: (teams, scores) => {
      var strText = '**Team Summary:**\n';
      
      module.exports.calculateTeamTotals(teams, scores)

      // sort descending
      teams.sort((a, b) => (a.totalScore < b.totalScore) ? 1 : -1);

      var i = 0;
      var t = new Table;
      teams.forEach(function (team) {
        i++
        module.exports.createTableRowTeam(i, t, team);
      })

      strText += '`' + t.toString() + '`';
    
      return strText;
    },

    printTeamLeaderboard: (scores, teams, expandedLayout) => {

      var strText = '**Team Leaderboard**:\n\n';

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

        var i = 0;
        var t = new Table;

        strText += '**Team:** ' + team.teamName + '\n';
        teamMembersScores.forEach(function (score) {
          i++
          module.exports.createTableRow(i, t, score, expandedLayout);
        })
    
        t.total('Score', {
          printer: function (val, width) {
            var str = 'Total: ' + numeral(val).format('0,0');
            return width ? Table.padLeft(str, width) : str;
          }
        });
        
        strText += '`' + t.toString() + '`\n';
      });

      return strText;
    },

    printCombinedLeaderboard: (scores, numOfScoresToShow, teams, showTeamDetails, expandedLayout) => {
      let textTableAsString = '\n';
  
      if (scores.length === 0) {
        return '**NO SCORES CURRENTLY POSTED**\n';
      } else {    
        if(teams && teams.length > 0) {
          textTableAsString += module.exports.printTeamSummary(teams, scores) + '\n';
          if(showTeamDetails) {   
            textTableAsString += module.exports.printTeamLeaderboard(scores, teams, expandedLayout) + '\n';
          }
        }

        textTableAsString += module.exports.printLeaderboard(scores, numOfScoresToShow, expandedLayout) + '\n';
    
        return textTableAsString;  
      }
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
      bp += '**Week:** ' + week + '\n';
      bp += '**Dates:** ' + period + '\n';
      bp += '\n';
      bp += '**Current Table:** ' + table + "\n";
      bp += '**Table Link:** ' + link + "\n\n";
      bp += module.exports.printCombinedLeaderboard(scores, null, teams, false, false);
      bp += '\n';
      bp += '**All Current & Historical Results:**\n';
      bp += 'https://www.iscored.info/?mode=public&user=ED209 \n';
  
      return bp;
    },
}
