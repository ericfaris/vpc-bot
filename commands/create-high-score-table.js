require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new high score table (High Scores Mod)',
  roles: ['High Score Corner Mod'],
  minArgs: 3,
  expectedArgs: '<tablename> <authorname> <versionnumber> <versionurl> <romname>',
  callback: async ({ args, client, channel, interaction, instance, user, message}) => {
    let retVal;
    let ephemeral = false;

    if(message) {
      interaction = message;
      ephemeral = true;
    }

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      const logMessage = `${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.`;
      retVal =  logMessage;
    } else {
      const [tablename, authorname, versionnumber, versionurl, romname] = args;

      var table = {
        '_id': mongoHelper.generateObjectId(),
        'tableName': tablename,
        'authors': [
          { '_id': mongoHelper.generateObjectId(),
            'authorName': authorname,
            'versions': [
              { '_id': mongoHelper.generateObjectId(),
                'versionNumber': versionnumber,
                'versionUrl': versionurl ?? '',
                'romName': romname ?? '',
                'scores': []
              }
            ]
          }
        ]
      }

      let existingTable = await mongoHelper.findOne({tableName: tablename}, 'tables'); 

      if(!existingTable) {
        await mongoHelper.insertOne(table, 'tables');
        retVal = `${table.tableName} (${table.authors[0]?.authorName} ${table.authors[0]?.versions[0]?.versionNumber}) created successfully`;
      } else {
        let existingAuthor = existingTable?.authors?.find(a => a.authorName === authorname);
        let existingVersion = existingAuthor?.versions?.find(v => v.versionNumber === versionnumber);

        let filter;
        let update;
        let options;

        if(!existingAuthor) {
          filter = { tableName: tablename};
          options = null;
          update = { $push: { 'authors' :           
              { '_id': mongoHelper.generateObjectId(),
                'authorName': authorname,
                'versions': [
                  { 'versionNumber': versionnumber,
                    'versionUrl': versionurl ?? '',
                    'romName': romname ?? '',
                    'scores': []
                  }]
              }
          }};      

          retVal = `New author and version created for ${tablename}.`;
        } else {
          if(!existingVersion) {
            filter = { tableName: tablename };
            options = { arrayFilters: [
              { 'a.authorName': authorname }
            ]};
            update = { $push: { 'authors.$[a].versions' :
              { '_id': mongoHelper.generateObjectId(),
                'versionNumber': versionnumber,
                'versionUrl': versionurl ?? '',
                'romName': romname ?? '',
                'scores': []
              }
            }};

            retVal = `New version created for ${tablename} (${authorname}).`;
          } else {
            retVal = `${tablename} (${authorname}) (${versionnumber}) already exists.`;
          }
        }

        if(filter && options && update) {
          await mongoHelper.updateOne(filter, update, options, 'tables');
        }
      }
    }

    if(message) {
      interaction.followUp({content: `**Trying to create new high score table:** ${retVal}`, ephemeral: ephemeral});
    } else {
      interaction.reply({content: retVal, ephemeral: ephemeral});
    }
  },
}
