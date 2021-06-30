const JSONdb = require('simple-json-db');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Edit message for Competition Corner.',
  minArgs: 3,
  expectedArgs: '<period> <table> <link>',
  callback: async ({args}) => {
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

    return 'Message updated successfully.';
  },
}
