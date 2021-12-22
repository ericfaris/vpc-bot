require('dotenv').config()
var outputHelper = require('../helpers/outputHelper');

module.exports = {

    deleteOriginalMessage: async (interaction, secondsToWait) => {
        setTimeout(async () => {
            await interaction.deleteReply()
                .catch((error) => {
                    interaction.reply({ content: error, ephemeral: true });
                })
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
        var contentArray = outputHelper.printHighScoreTables(searchTerm, tables, 5, false)
        module.exports.postHighScoreEphemeralMessages(contentArray, interaction);
    },

    postHighScoreEphemeralMessages: async (contentArray, interaction) => {
        for (const post of contentArray) {
            await interaction.reply({ content: post, ephemeral: true})
                .catch((error) => {
                    interaction.reply({ content: error, ephemeral: true });
                })
        };
    },

    postEphemeralMessages: async (contentArray, interaction) => {
        const delay = timeToWait => new Promise(resolve => setTimeout(resolve, timeToWait));

        for (const post of contentArray) {
            await interaction.reply({ content: post, ephemeral: true})
                .catch((error) => {
                    interaction.reply({ content: error, ephemeral: true });
                });
            await delay(1000);
        };
    },

    showEphemeralScore: async (score, numOfScores, t, interaction) => {
        outputHelper.createTableRow(score.rank.toString() + ' of ' + numOfScores.toString(), t, score, true);
        let post = '`' + t.toString() + '`';
        await interaction.reply({ content: post, ephemeral: true})
            .catch((error) => {
                interaction.reply({ content: error, ephemeral: true });
            })
    },

    showEphemeralTeams: async (scores, teams, interaction) => {
        interaction.reply({ content: outputHelper.printTeamLeaderboard(scores, teams, false), ephemeral: true})
            .catch((error) => {
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