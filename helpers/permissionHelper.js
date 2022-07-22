require('dotenv').config()
const Logger = require('./loggingHelper');

class PermissionHelper {

    constructor(){};

    async hasRole(client, interaction, roles, commandName) {
        let logger = (new Logger(interaction?.member?.user)).logger;
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        const hasRole = [...member.roles.cache.values()].some(value => roles?.indexOf(value?.name) > -1);
        logger.info(`roles: ${roles.join(', ')}`);
        logger.info(`hasRole: ${hasRole}}`);

        return (!hasRole ? `${interaction.member.user.username} DOES NOT have the correct role to run ${commandName}.` : null);
    }

    async isValidChannel(channels, interaction, commandName) {
        let logger = (new Logger(interaction?.member?.user)).logger;
        const isValidChannel = channels.includes(interaction.channel.name);
        logger.info(`channelName: ${interaction.channel.name}`);
        logger.info(`isValidChannel: ${isValidChannel}}`);

        return (!isValidChannel ? `The ${commandName} slash command cannot be used in this channel.` : null);
    }

}

module.exports.PermissionHelper = PermissionHelper;