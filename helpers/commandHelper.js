class CommandHelper {

    constructor(){};

    async execute(instance, interaction, message, commandName, args) {
        let command = instance.commandHandler._commands.get(commandName);
        try {
            interaction.commandName = commandName;
            await command.execute(interaction, args);
        } catch (e) {
            if (e) {
            console.error(e)
            }
        }
    }
    
}

module.exports.CommandHelper = CommandHelper;