const JSONdb = require('simple-json-db');

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Edit post for Competition Corner.',
  minArgs: 3,
  expectedArgs: '<period> <table> <link>',
  callback: async ({args}) => {
    const db = new JSONdb('db.json');
    const [period, table, link] = args;

    var obj = 
    {
      'period': period,
      'table': table,
      'tableLink': link 
    }

    //save scores to db
    db.set('details', JSON.stringify(obj));

    return 'Post updated successfully.';
  },
}
