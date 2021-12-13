require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
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
  callback: async ({ args, client, channel, interaction, instance, user}) => {
    let retVal;

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      const logMessage = `${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.`;
      console.log(logMessage)
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      return logMessage;
    }

    if (channel.name !== process.env.HIGH_SCORES_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.delErrMsgCooldown);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.HIGH_SCORES_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.delErrMsgCooldown} seconds.`;
      return retVal;
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
        return `${table.tableName} (${table.authors[0]?.authorName} ${table.authors[0]?.versions[0]?.versionNumber}) created successfully`;
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
            return `${tablename} (${authorname}) (${versionnumber}) already exists.`;
          }
        }

        await mongoHelper.updateOne(filter, update, options, 'tables');

        return retVal;
      }
    }
  },
}
