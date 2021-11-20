require('dotenv').config()
const path = require('path');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Create new high score table (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 3,
  expectedArgs: '<tablename> <authorname> <version> <versionUrl> <romName>',
  callback: async ({ args, client, channel, interaction, instance }) => {
    let retVal;

    if (!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }

    if (channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.`
        + ` This message will be deleted in ${instance.del} seconds.`;
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
