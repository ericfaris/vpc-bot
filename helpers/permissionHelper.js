require('dotenv').config()

module.exports = {

    hasPermissionOrRole: async (client, interaction, permissions, roles) => {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        const hasRole = member.roles.cache.some(role => roles?.indexOf(role.name) > -1);

        return member.hasPermission(permissions) || hasRole;
    }
}