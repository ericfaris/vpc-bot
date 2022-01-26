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

    showLeaderboard: async (scores, teams, interaction, isEphemeral) => {
        var contentArray = outputHelper.printCombinedLeaderboard(scores, null, teams, false, false);
        module.exports.postMessages(contentArray, interaction, isEphemeral);
    },

    showSeasonLeaderboard: async (weeks, interaction, isEphemeral) => {
        var contentArray = outputHelper.printSeasonLeaderboard(weeks, null, false)
        module.exports.postMessages(contentArray, interaction, isEphemeral);
    },

    showHighScoreTables: async (tables, searchTerm, interaction, isEphemeral) => {
        var contentArray = outputHelper.printHighScoreTables(searchTerm, tables, 10, 5, isEphemeral)
        module.exports.postMessages(contentArray, interaction, isEphemeral);
    },

    postMessages: async (contentArray, interaction, isEphemeral) => {
        for (const post of contentArray) {
            if (!isEphemeral && interaction.channel) {
                await interaction.channel.send(post);
            }else if(interaction.hasOwnProperty('replied') && (!interaction.replied)) {
                await interaction.reply({ content: post, ephemeral: isEphemeral})
                    .catch((error) => {
                        interaction.reply({ content: error.message, ephemeral: isEphemeral });
                    })
            } else if (interaction.hasOwnProperty('replied') && (interaction.replied)) {
                await interaction.followUp({ content: post, ephemeral: isEphemeral})
                    .catch((error) => {
                        interaction.followUp({ content: error.message, ephemeral: isEphemeral });
                    })
            }
        };
    },

    showScore: async (score, numOfScores, t, interaction, isEphemeral) => {
        outputHelper.createTableRow(score.rank.toString() + ' of ' + numOfScores.toString(), t, score, true);
        let post = '`' + t.toString() + '`';
        await interaction.reply({ content: post, ephemeral: isEphemeral})
            .catch((error) => {
                interaction.reply({ content: error.message, ephemeral: isEphemeral });
            })
    },

    showTeams: async (scores, teams, interaction, isEphemeral) => {
        interaction.reply({ content: outputHelper.printTeamLeaderboard(scores, teams, false), ephemeral: isEphemeral})
            .catch((error) => {
                interaction.reply({ content: error.message, ephemeral: true });
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