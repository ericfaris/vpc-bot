const Logger = require('../../helpers/loggingHelper');
const { SearchScorePipelineHelper } = require('../../helpers/pipelineHelper');
const date = require('date-and-time');
const postHighScoreCommand = require('../../commands/post-high-score');
const showTableHighScoresCommand = require('../../commands/show-table-high-scores');
var numeral = require('numeral');
const mongoHelper = require('../../helpers/mongoHelper');
const { InteractionType } = require('discord.js');

module.exports = async (interaction, instance) => {
    let logger = (new Logger(interaction.user)).logger;

    var user = interaction.user;
    var channel = interaction.channel;
    var client = instance.client;

    if (interaction.type !== InteractionType.MessageComponent || interaction.commandName !== 'post-high-score') return;

    try {
        let selectedJson = JSON.parse(interaction.values[0]);
        let pipeline = (new SearchScorePipelineHelper(selectedJson.vpsId, selectedJson.v)).pipeline;
        const tables = await mongoHelper.aggregate(pipeline, 'tables');
        let existingUser;

        if (tables.length === 1) {
            let data = tables[0];
            selectedJson.tableName = data.tableName;
            selectedJson.authorName = data.authorName;
            selectedJson.versionNumber = data.versionNumber;
            selectedJson.vpsId = data.vpsId;
            let newScore = selectedJson.s;
            let existingScore = data?.score;

            let authorsArray = selectedJson?.authorName?.split(', ');
            let firstAuthor = authorsArray?.shift();

            if (data?.user?.id) {
                existingUser = await interaction.client.users.fetch(data?.user.id);
            }

            if ((!existingScore) || (newScore > existingScore)) {
                await postHighScoreCommand.saveHighScore(selectedJson, interaction).then(async () => {
                    const user = await client.users.cache.find(user => user.username === selectedJson.u)
                    await interaction.update({
                        content:
                            `**NEW TOP HIGH SCORE POSTED:**\n` +
                            `**User**: <@${user.id}>\n` +
                            `**Table:** ${selectedJson.tableName} (${firstAuthor}... ${selectedJson.versionNumber})\n` +
                            `**VPS Id:** ${selectedJson.vpsId}\n` +
                            `**Score:** ${numeral(selectedJson.s).format('0,0')}\n` +
                            `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`,
                        components: []
                    });

                    logger.info(`Trying to show high scores for ${selectedJson.tableName}`)

                    interaction.options = { data: [] };
                    interaction.options.data.push({ name: 'tablesearchterm', value: selectedJson.tableName });
                    interaction.options.data.push({ name: 'vpsid', value: selectedJson.vpsId });
                    interaction.options.data.push({ name: 'isephemeral', value: 'false' });

                    await showTableHighScoresCommand.callback({ args: [selectedJson.tableName, selectedJson.vpsId, false], client: client, channel: channel ?? interaction.channel, interaction: interaction, instance: instance, message: interaction?.message, user: user });

                    logger.info('Checking to send a DM to user who had high score.')
                    if (existingUser && (existingUser.username !== user.username)) {
                        let content = `**@${user?.username}** just topped your high score for**:\n` +
                            `${selectedJson?.tableName} (${firstAuthor}... ${selectedJson?.versionNumber})**\n` +
                            `**Score: **${numeral(selectedJson?.s).format('0,0')}\n` +
                            `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n\n` +
                            `Link: ${interaction?.message?.url}`;

                        logger.info('Sending DM to previous High Score holder.')
                        await existingUser.send(content);
                    };
                }).catch(async (e) => {
                    logger.error(e)
                    await interaction.followUp({
                        content: `${e}`,
                        components: [],
                        files: [],
                    });
                });
            } else {
                await postHighScoreCommand.saveHighScore(selectedJson, interaction)
                    .then(async () => {
                        const user = await client.users.cache.find(user => user.username === selectedJson.u)
                        await interaction.update({
                            content:
                                `**NEW HIGH SCORE POSTED:**\n` +
                                `**User**: <@${user.id}>\n` +
                                `**Table:** ${selectedJson.tableName} (${firstAuthor}... ${selectedJson.versionNumber})\n` +
                                `**VPS Id:** ${selectedJson.vpsId}\n` +
                                `**Score:** ${numeral(selectedJson.s).format('0,0')}\n` +
                                `**Posted**: ${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss')}\n`,
                            components: []
                        });

                        interaction.options = { data: [] };
                        interaction.options.data.push({ name: 'tablesearchterm', value: selectedJson.tableName });
                        interaction.options.data.push({ name: 'vpsid', value: selectedJson.vpsId });
                        interaction.options.data.push({ name: 'isephemeral', value: 'false' });

                        await showTableHighScoresCommand.callback({ args: [selectedJson.tableName, selectedJson.vpsId, false], client: client, channel: channel ?? interaction.channel, interaction: interaction, instance: instance, message: interaction?.message, user: user });
                    }).catch(async (e) => {
                        logger.error(e)
                        await interaction.followUp({
                            content: `${e}`,
                            components: [],
                            files: [],
                        });
                    });
            }
        } else if (tables.length === 0) {
            throw new Error('No matches found.');
        } else {
            throw new Error('Multiple matches found.');
        }
    } catch (e) {
        logger.error(e);
        if (!interaction.replied) {
            await interaction.reply({
                content: `${e}`,
                components: [],
                files: [],
            });
        } else {
            await interaction.followUp({
                content: `${e}`,
                components: [],
                files: [],
            });
        }
    }
}