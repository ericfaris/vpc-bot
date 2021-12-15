require('dotenv').config()
const path = require('path');
const RandomOrg = require('random-org');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Generate a random number between 1 and X',
  minArgs: 1,
  expectedArgs: '<max>',
  callback: async ({ args, client, channel, interaction, instance, user }) => {
    const [ max ] = args;
    let retVal;

    try{
      var random = new RandomOrg({ apiKey: process.env.RANDOMORG_API_KEY });
      retVal= (await random.generateIntegers({ min: 1, max: max, n: 1 })).random.data[0];
    } catch(error) {
      throw error;
    }

    return `**${retVal}** (1 - ${max})`;
  },
} 
