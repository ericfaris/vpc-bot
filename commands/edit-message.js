const JSONdb = require('simple-json-db');
var postScore = require('./post-score');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Edit message for Competition Corner.',
  permissions: ['ADMINISTRATOR'],
  minArgs: 3,
  expectedArgs: '<period> <table> <link>',
  callback: async ({args, client, channel}) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The edit-message slash command can only be used in the competition-corner channel.';
    } else {
      const db = new JSONdb('db.json');
      const [period, table, link] = args;

      var obj = 
      {
        'period': period,
        'table': table,
        'link': link 
      }

      //save scores to db
      db.set('details', JSON.stringify(obj));

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      //post to competition channel pinned message
      await postScore.editChannel(scores, client);

      retVal =  'Message updated successfully.';
    }

    return retVal;
  },
}
