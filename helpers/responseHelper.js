require('dotenv').config()
var request = require('request');
var outputHelper = require('../helpers/outputHelper');

module.exports = {

    deleteOriginalMessage: async(interaction, secondsToWait) => {
        var options = {
            'method': 'DELETE',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '/messages/@original',
            'headers': {
              'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
            }
        };

        setTimeout(function(){ 
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('removing original message, response.body: ' + response.body);
            });         
        }, secondsToWait * 1000);

    },

    showEphemeralLeaderboard: async (scores, teams, interaction) => {
        var options = {
            'method': 'POST',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '?wait=true', 
            'headers': {
                'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": outputHelper.printCombinedLeaderboard(scores, null, teams, false, false),
                "flags": 64
            })
        };
    
        await request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);  
        });
    },

    showEphemeralSeasonLeaderboard: async (weeks, interaction) => {
        var options = {
            'method': 'POST',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '?wait=true', 
            'headers': {
                'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": outputHelper.printSeasonLeaderboard(weeks, false),
                "flags": 64
            })
        };
    
        await request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);  
        });
    },

    showEphemeralScore: async (score, numOfScores, t, interaction) => {
        outputHelper.createTableRow(score.rank.toString() + ' of ' + numOfScores.toString(), t, score, true);
        var options = {
            'method': 'POST',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '?wait=true', 
            'headers': {
                'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": "`" + t.toString() + "`",
                "flags": 64
            })
        };
    
        await request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);  
        });
    },

    showEphemeralTeams: async (scores, teams, interaction) => {
        var options = {
            'method': 'POST',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '?wait=true', 
            'headers': {
                'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": outputHelper.printTeamLeaderboard(scores, teams, false),
                "flags": 64
            })
        };
    
        await request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);  
        });
    },

    postJsonDataFiles: async (client) => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
  
        today = mm + '/' + dd + '/' + yyyy;
  
        const compChannel = await client.channels.fetch(process.env.DATA_BACKUPS_CHANNEL_ID);
  
        compChannel.send(`Competition Corner Data Backup for ${today}`, {
          files: [
            "./data/db.json",
            "./data/archive.json",
            "./data/season.json"
          ]
        });  
    }
}