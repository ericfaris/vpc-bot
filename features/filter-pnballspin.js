module.exports = (client) => {

    client.on("messageCreate", (message) => {
        const { channel, author } = message
        const OFFENDING_USER = 'pnballspin';
        let regexp = /^\b[a-zA-Z0-9_]+\b$/gi;
        //   let regexp = /^\b[a-zA-Z0-9_]+\b$|^\b[a-zA-Z0-9_]+\b \b[a-zA-Z0-9_]+\b$/gi;

        if(author.username === OFFENDING_USER && message.content.match(regexp)) {
            message.delete();
            author.send('Message deleted as not relevant.');
        }
    })
}