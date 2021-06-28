const JSONdb = require('simple-json-db');
var Table = require('easy-table')

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Create teams for Competition Corner.',
  minArgs: 1,
  expectedArgs: '<team>',
  callback: ({args, interaction}) => {
    const db = new JSONdb('db.json');
    const t = new Table;
    const [team] = args;

    const teamName = team.substring(0, team.indexOf(":"));
    const members = team.substring(team.indexOf(":")+1).split(",");

    // get teams from db
    const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

    //search for existing team
    const existingTeam = teams.find(x => x.teamName === teamName);

    // update or add teams
    if (existingTeam) {
      existingTeam.members = members;
    } else {
      teams.push({'teamName': teamName, 'members': members});
    }

    //save teams to db
    db.set('teams', JSON.stringify(teams));

    // create text table
    var i = 0;
    members.forEach(function(member) {
      t.cell(teamName, member)
      t.newRow()
    })
    
    // return text table string
    return 'Team created successfully. \n\n' + t.toString();
  },
}