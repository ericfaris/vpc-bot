require('dotenv').config()
var outputHelper = require('../helpers/outputHelper');

module.exports = {

    deleteOriginalMessage: async (interaction, secondsToWait) => {
        setTimeout(async () => {
            await interaction.deleteReply()
                .catch((error) => {
                    if (error) throw new Error(error);
                });
        }, secondsToWait * 1000);
    },

    showEphemeralLeaderboard: async (scores, teams, interaction) => {
        var contentArray = outputHelper.printCombinedLeaderboard(scores, null, teams, false, false);
        module.exports.postEphemeralMessages(contentArray, interaction);
    },

    showEphemeralSeasonLeaderboard: async (weeks, interaction) => {
        var contentArray = outputHelper.printSeasonLeaderboard(weeks, null, false)
        module.exports.postEphemeralMessages(contentArray, interaction);
    },

    showEphemeralHighScoreTables: async (tables, searchTerm, interaction) => {
        var contentArray = outputHelper.printHighScoreTables(searchTerm, tables, null, false)
        module.exports.postHighScoreEphemeralMessages(contentArray, interaction);
    },

    postHighScoreEphemeralMessages: async (contentArray, interaction) => {
        const delay = timeToWait => new Promise(resolve => setTimeout(resolve, timeToWait));

        for (const post of contentArray) {
            interaction.reply({ content: post, ephemeral: true, fetchReply: true}).then((message) => {
                message.suppressEmbeds(true);
            })
        };
    },

    postEphemeralMessages: async (contentArray, interaction) => {
        const delay = timeToWait => new Promise(resolve => setTimeout(resolve, timeToWait));

        for (const post of contentArray) {
            interaction.reply({ content: post, ephemeral: true}).then((message) => {
                message.suppressEmbeds(true);
            })
            await delay(1000);
        };
    },

    showEphemeralScore: async (score, numOfScores, t, interaction) => {
        outputHelper.createTableRow(score.rank.toString() + ' of ' + numOfScores.toString(), t, score, true);

        interaction.reply({ content: post, ephemeral: true}).then((message) => {
            message.suppressEmbeds(true);
        }).catch((error) => {
            if (error) throw new Error(error);
        })
    },

    showEphemeralTeams: async (scores, teams, interaction) => {
        interaction.reply({ content: outputHelper.printTeamLeaderboard(scores, teams, false), ephemeral: true}).then((message) => {
            message.suppressEmbeds(true);
        }).catch((error) => {
            if (error) throw new Error(error);
        })
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