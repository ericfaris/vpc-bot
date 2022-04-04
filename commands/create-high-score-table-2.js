require('dotenv').config()
const path = require('path');
const permissionHelper = require('../helpers/permissionHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { VPCDataService } = require('../services/vpcDataService')
const { VPSDataService } = require('../services/vpsDataService');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Create new high score table (High Scores Mod)',
  roles: ['High Score Corner Mod'],
  minArgs: 1,
  expectedArgs: '<vpsid>',
  callback: async ({ args, client, channel, interaction, instance, user, message}) => {
    let retVal;
    let ephemeral = false;
    let vpcDataService = new VPCDataService();
    let vpsDataService = new VPSDataService();

    if(message) {
      interaction = message;
      ephemeral = true;
    }

    if (!(await permissionHelper.hasRole(client, interaction, module.exports.roles))) {
      const logMessage = `${interaction.member.user.username} DOES NOT have the correct role to run ${module.exports.commandName}.`;
      retVal =  logMessage;
    } else {
      const [vpsid] = args;

      let tableName 
      let authorName;
      let versionNumber;
      let versionUrl;
      let romName;

      const vpsGame = await vpsDataService.getVpsGame(vpsid);

      if (vpsGame.table) {

        tableName = `${vpsGame?.name} (${vpsGame?.year} ${vpsGame?.manufacturer})`;
        authorName = vpsGame?.table?.authors?.join(", ") ?? '';
        versionNumber = vpsGame?.table?.version ?? '';
        versionUrl = vpsGame?.table?.urls ? vpsGame?.table?.urls[0]?.url ?? '' : '';
        romName = vpsGame?.romFiles ? vpsGame?.romFiles[0]?.version ?? '' : '';

        var table = {
          '_id': mongoHelper.generateObjectId(),
          'tableName': tableName,
          'authors': [
            { '_id': mongoHelper.generateObjectId(),
              'authorName': authorName,
              'versions': [
                { '_id': mongoHelper.generateObjectId(),
                  'versionNumber': versionNumber,
                  'versionUrl': versionUrl ?? '',
                  'romName': romName ?? '',
                  'scores': []
                }
              ],
              'vpsId': vpsid
            }
          ]
        }

        let existingTable = await mongoHelper.findOne({tableName: tableName}, 'tables'); 

        if(!existingTable) {
          await mongoHelper.insertOne(table, 'tables');
          retVal = `${table.tableName} (${table.authors[0]?.authorName} ${table.authors[0]?.versions[0]?.versionNumber}) created successfully`;
        } else {
          let existingAuthor = existingTable?.authors?.find(a => a.authorName === authorName);
          let existingVersion = existingAuthor?.versions?.find(v => v.versionNumber === versionNumber);

          let filter;
          let update;
          let options;

          if(!existingAuthor) {
            filter = { tableName: tablename};
            options = null;
            update = { $push: { 'authors' :           
                { '_id': mongoHelper.generateObjectId(),
                  'authorName': authorName,
                  'versions': [
                    { 'versionNumber': versionNumber,
                      'versionUrl': versionUrl ?? '',
                      'romName': romName ?? '',
                      'scores': []
                    }],
                  'vpsId': vpsid
                }
            }};      

            retVal = `New author and version created for ${tablename}.`;
          } else {
            if(!existingVersion) {
              filter = { tableName: tablename };
              options = { arrayFilters: [
                { 'a.authorName': authorName }
              ]};
              update = { $push: { 'authors.$[a].versions' :
                { '_id': mongoHelper.generateObjectId(),
                  'versionNumber': versionNumber,
                  'versionUrl': versionUrl ?? '',
                  'romName': romName ?? '',
                  'scores': []
                }
              }};

              retVal = `New version created for ${tableName} (${authorName}).`;
            } else {
              retVal = `${tableName} (${authorName}) (${versionNumber}) already exists.`;
            }
          }

          if(filter && options && update) {
            await mongoHelper.updateOne(filter, update, options, 'tables');
          }
        }

      if(message) {
        interaction.followUp({content: `**Trying to create new high score table:** ${retVal}`, ephemeral: ephemeral});
      } else {
        interaction.reply({content: retVal, ephemeral: ephemeral});
      }
      } else {
        retVal = `No VPS Tables were found.  Please double check your VPS ID.`;
      }
    }
  },
}
