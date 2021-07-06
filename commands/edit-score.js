const JSONdb = require('simple-json-db');
var postScore = require('./post-score');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Edit score for Competition Corner.',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  expectedArgs: '<username> <score>',
  callback: async ({args, channel, client, interaction}) => {
    let retVal;
    
    if(channel.name !== 'competition-corner') {
      retVal = 'The edit-score slash command can only be used in the competition-corner channel.';
    } else {
      const [username, score] = args;
      retVal = postScore.saveScore(username, score, client, interaction);
    }

    return retVal;
  },
}
