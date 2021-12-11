require('dotenv').config()
const { Permissions } = require('discord.js');
const Logger = require('../helpers/loggingHelper');

module.exports = {

    hasPermissionOrRole: async (client, interaction, permissions, roles, user) => {
        let logger = (new Logger(user)).logger;
        logger.info('in callback');
    
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        const hasRole = [...member.roles.cache.values()].some(value => roles?.indexOf(value?.name) > -1);
        const hasManageGuildPermission = member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
        logger.info(`hasRole: ${hasRole}, hasManageGuildPermission: ${hasManageGuildPermission}`);
        
        return hasRole || hasManageGuildPermission;
    }
}