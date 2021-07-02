require('dotenv').config()

module.exports = {
  slash: true,
  testOnly: false,
  description: 'Create message for Competition Corner.',
  callback: async ({client}) => {
    const channel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
    channel.send('new message');
    return 'Message created successfully.';
  },
}
