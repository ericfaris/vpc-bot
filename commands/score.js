
const { simpleSessionStorage } = require('simple-storage')
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
    const existing = scores.find(x => '@' + x.username === userName);

    if (existing) {
      existing.score = score;
    } else {
      scores.push({'username': userName, 'score': score});
    }

    simpleSessionStorage.setItem("scores", scores); 
    
    scores.forEach(function(score) {
      t.cell('User', '**' + score.username + '**')
      t.cell('Score', score.score)
      t.newRow()
    })
    
    return t.toString();
  },
}