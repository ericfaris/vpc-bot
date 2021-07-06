var Table = require('easy-table')
var numeral = require('numeral');
const { MessageEmbed } = require('discord.js')

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
    }
    
}