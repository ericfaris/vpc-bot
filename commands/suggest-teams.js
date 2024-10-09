require('dotenv').config()
const Logger = require('../helpers/loggingHelper');
const path = require('path');
const { PermissionHelper } = require('../helpers/permissionHelper');
const { RankingPipelineHelper } = require('../helpers/pipelineHelper');
const mongoHelper = require('../helpers/mongoHelper');
var numeral = require('numeral');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Suggest teams for contest.',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 4,
  expectedArgs: '<messageId> <numberOfWeeksToTotal> <numberOfTeams> <minTeamSize>',
  callback: async ({ args, channel, interaction, client, user, instance }) => {
    let logger = (new Logger(user)).logger;
    let permissionHelper = new PermissionHelper();
    let retVal = '';
    let pArray = new Array();
    let messageId = String(args[0])
    let totalWeeks = parseInt(args[1]);
    let numberOfTeams = parseInt(args[2]);
    let minTeamSize = parseInt(args[3]);
    
    const message = await channel.messages.fetch(messageId);
    userReactions = message.reactions.cache;
    let users;
    try {
      for (const reaction of userReactions.values()) {
        users = await reaction.users.fetch();
      }
    }
    finally{} 

    users.forEach(u => {
      pArray.push(u.username);
    })

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
     
      const week = await mongoHelper.findCurrentWeek(channel.name);
      const weeks = new Array();

      for(let i=1;i<totalWeeks;i++) {
        weeks.push(week.weekNumber-i);
      }

      const pipeline = (new RankingPipelineHelper(weeks, pArray)).pipeline;
      const rankings = await mongoHelper.aggregate(pipeline, 'weeks');
      const chunkPlayers = module.exports.chunkWithMinSize(rankings, numberOfTeams, minTeamSize);
      const teams = module.exports.equalizeChunks(chunkPlayers);

      retVal = ''
      let i = 1
      let playersWithNoHistory = new Array();

      let x=1;
      rankings.forEach(r => {
        retVal += `${x} **${r._id}** ${numeral(r.total).format('0,0')}\n`;
        x++;
      })

      retVal += '\n';

      teams.forEach(team => {
        let roster = team.roster.map(u => u._id).join(', ');
        retVal += `**Team ${i}** (${numeral(team.totalScore).format('0,0')}): ${roster}\n\n`;
        i++;

        playersWithNoHistory = team.roster.map(u => u._id);
        pArray = pArray.filter(x => !(playersWithNoHistory.includes(x)));
      })

      playersWithNoHistory = pArray;
      retVal += `**Did Not Play: **: ${playersWithNoHistory.join(', ')}\n\n`;

      interaction.reply({content: retVal, ephemeral: true});
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },

  chunkWithMinSize: (arr, chunkSize, minChunkSize = 0) => {
    const remainder = arr.length % chunkSize;
    const isLastChunkTooSmall = remainder > minChunkSize;
    const totalChunks = isLastChunkTooSmall
      ? Math.floor(arr.length / chunkSize)
      : Math.ceil(arr.length / chunkSize);
    return Array.from({ length: totalChunks }, (_, i) => {
      const chunk = arr.slice(i * chunkSize, i * chunkSize + chunkSize);
      if (i === totalChunks - 1 && isLastChunkTooSmall)
        chunk.push(...arr.slice(-remainder));
      return chunk;
    });
  },

  equalizeChunks: (chunks) => {
    let teams = new Array();
    const numberOfTeams = chunks[0].length;
    for(let i=0; i<numberOfTeams; i++) {
      teams.push(new Array());
    }

    let i = 0;
    chunks.forEach(level => {    
      if(i % 2 !== 0) {
        level.reverse();
      }

      let x = 0;
      let y = numberOfTeams - 1;
      let goingUp = true;
      level.forEach(levelRank => {
        if(x >= numberOfTeams) {
          teams[y].push(levelRank);
          goingUp ? y-- : y++;
          y === 0 ? goingUp = false : (y == numberOfTeams - 1) ? goingUp = true : '';
        }
        else {
          teams[x].push(levelRank);
        } 
        x++;
      })

      i++
    }); 
    
    let finalTeams = new Array();
    teams.forEach(team => {
      let teamWithSum = new Object();
      teamWithSum.roster = team;
      teamWithSum.totalScore = teamWithSum.roster.reduce((pv, cv) => pv + cv.total,0);
      finalTeams.push(teamWithSum);
    })

    return finalTeams;
  }
}