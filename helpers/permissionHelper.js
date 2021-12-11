require('dotenv').config()
const Logger = require('../helpers/loggingHelper');

module.exports = {

    hasRole: async (client, interaction, roles) => {
        let logger = (new Logger(interaction.member.user)).logger;
        logger.info('in callback');
    
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(interaction.member.user.id);
        const hasRole = [...member.roles.cache.values()].some(value => roles?.indexOf(value?.name) > -1);
        logger.info(`hasRole: ${hasRole}`);
        
        return hasRole;
    }
}