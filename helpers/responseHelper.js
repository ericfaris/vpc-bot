require('dotenv').config()
var request = require('request');
var outputHelper = require('../helpers/outputHelper');

module.exports = {

    deleteOriginalMessage: async(interaction) => {
        var options = {
            'method': 'DELETE',
            'url': process.env.DISCORD_BASE_API + '/webhooks/' + process.env.APPLICATION_ID + '/' + interaction.token + '/messages/@original',
            'headers': {
              'Authorization': 'Bearer ' + process.env.BOT_TOKEN,
            }
        };

        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });         

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
                "content": outputHelper.printCombinedLeaderboard(scores, null, teams, true, true),
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
}