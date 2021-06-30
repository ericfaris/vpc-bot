const COMPETITION_CHANNEL_ID = '854595057382457366';

module.exports = {
  slash: true,
  testOnly: true,
  description: 'Create message for Competition Corner.',
  callback: async ({client}) => {
    const channel = await client.channels.fetch(COMPETITION_CHANNEL_ID);
    channel.send('new message');
    return 'Message created successfully.';
  },
}
