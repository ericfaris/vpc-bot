require('dotenv').config()
const { Permissions } = require('discord.js');

module.exports = {

    hasPermissionOrRole: async (client, interaction, permissions, roles) => {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        const hasRole = [...member.roles.cache.values()].some(value => roles?.indexOf(value?.name) > -1);
        
        return (hasRole) || (member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD));
    }
}