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
  roles: ['High Scores Mod'],
  minArgs: 2,
  expectedArgs: '<tablename> <authorname> <version> <versionUrl> <romName>',
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
      const [tablename, authorname, version, versionurl, romname] = args;

      var table = {
        'tableName': tablename,
        'authors': [
          { 'authorName': authorname,
            'versions': [
              { 'version': version,
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
        return `New high score table created.`;
      } else {
        let existingAuthor = existingTable?.authors?.find(a => a.authorName === authorname);
        let existingVersion = existingAuthor?.versions?.find(v => v.version === version);

        let filter;
        let update;
        let options;

        if(!existingAuthor) {
          filter = { tableName: tablename};
          options = null;
          update = { $push: { 'authors' :           
              { 'authorName': authorname,
                'versions': [
                  { 'version': version,
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
              { 'version': version,
                'versionUrl': versionurl ?? '',
                'romName': romname ?? '',
                'scores': []
              }
            }};

            retVal = `New version created for ${tablename} (${authorname}).`;
          } else {
            return `${tablename} (${authorname}) (${version}) already exists.`;
          }
        }

        await mongoHelper.updateOne(filter, update, options, 'tables');

        return retVal;
      }
    }
  },
}
