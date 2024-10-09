module.exports = (interaction, instance) => {
    const { channel, author } = interaction
    const OFFENDING_USER = 'pnballspin';
    let regexp = /^\b[a-zA-Z0-9_]+\b$/gi;

    if (author.username === OFFENDING_USER && interaction.content.match(regexp)) {
        interaction.delete();
        author.send('Message deleted as not relevant.');
    }
}