
const { simpleSessionStorage } = require('simple-storage')
const { MessageEmbed } = require('discord.js')
var markdownConverter = require('json-to-markdown-table');
var Table = require('easy-table')

module.exports = {
  slash: true,
  testOnly: true,
  description: 'A bot to help with the Competition Corner Weekly Table Scores',
  minArgs: 1,
  expectedArgs: '<score>',
  callback: ({args, interaction}) => {
    const t = new Table;
    const [score] = args;
    const userName = '@' + interaction.member.user.username;
    const columns = [
     'username',
     'score'
    ];
    const scores = simpleSessionStorage.getItem("scores") || [];
    const score1 = scores.find(x => '@' + x.username === userName);

    if (score1) {
      score1.score = score;
    } else {
      scores.push({'username': userName, 'score': score});
    }

    simpleSessionStorage.setItem("scores", scores); 
    const table = markdownConverter(scores, columns);
    
    scores.forEach(function(score) {
      t.cell('User', '**' + score.username + '**')
      t.cell('Score', score.score)
      t.newRow()
    })
    
    return t.toString();
  },

// module.exports = {
//   slash: true,
//   testOnly: true,
//   description: 'A simple ping pong command!!!',
//   minArgs: 2,
//   expectedArgs: '<Name> <Age> [Country]',
//   callback: ({ message, args }) => {
//     const embed = new MessageEmbed().setTitle('Example').setDescription('pong')

//     const [name, age, country] = args

//     embed.addField('Name', name)
//     embed.addField('Age', age)
//     embed.addField('Country', country || 'None')

//     if (message) {
//       message.reply('', { embed })
//     }

//     return embed
//   },
}