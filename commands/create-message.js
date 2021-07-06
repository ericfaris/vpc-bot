const DiscordJS = require('discord.js')
const https =  require('https');
require('dotenv').config()
const fetch = require('node-fetch');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  permissions: ['ADMINISTRATOR'],
  description: 'Create message for Competition Corner.',
  callback: async ({client, channel, interaction}) => {
    let retVal;
    if(channel.name !== 'competition-corner') {
      // await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
      //   type: 4,
      //   data: {
      //     content: interaction.token
      //   }
      // }});

      // const options = {
      //   hostname: 'discordapp.com',
      //   port: 443,
      //   path: '/api/webhooks/860310881577467904/' + interaction.token + '/messages/@original',
      //   method: 'DELETE'
      // }

      //   // await https.request(options);
      
      // const req = https.request(options, (res) => {
      //   console.log('statusCode:', res.statusCode);
      //   console.log('headers:', res.headers);
      
      //   res.on('data', (d) => {
      //     process.stdout.write(d);
      //   });
      // });

      // new DiscordJS.WebhookClient(client.user.id, interaction.token).send('test')

      // setTimeout(() => {
      //   // client.api.interactions(interaction.id, interaction.token).callback.delete()
      //   request.request(options), 
      //   3000
      // });

      retVal = 'The create-message slash command can only be used in the <#CHANNELID> channel.';
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      compChannel.send('new message');

      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
