require('dotenv').config()

module.exports = {

    hasPermission: async (client, interaction, permissions) =>{
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        
        return member.hasPermission(permissions);
    }
}