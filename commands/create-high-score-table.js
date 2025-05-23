require('dotenv').config()
const path = require('path');
const Logger = require('../helpers/loggingHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { ArgHelper } = require('../helpers/argHelper');
const { VPSDataService } = require('../services/vpsDataService');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  hidden: true,
  description: 'Creates new high score table.',
  roles: [process.env.BOT_HIGH_SCORE_ADMIN_ROLE_NAME],
  channels: [],
  minArgs: 1,
  expectedArgs: '<vpsid>',
  callback: async ({ args, client, channel, interaction, instance, user, message }) => {
    const logger = (new Logger(user)).logger;
    const argHelper = new ArgHelper();
    const permissionHelper = new PermissionHelper();
    const vpsDataService = new VPSDataService();
    let retVal;
    let ephemeral = false;

    if (message) {
      interaction = message;
      ephemeral = true;
    }

    // Check if the User has a valid Role
    retVal = await permissionHelper.hasRole(client, interaction, module.exports.roles, module.exports.commandName);
    if (retVal) { interaction.reply({ content: retVal, ephemeral: true }); return; }

    try {
      const vpsid = argHelper.getArg(interaction.options.data, 'string', 'vpsid');
      let tableName;
      let comment;
      let authorName;
      let versionNumber;
      let versionUrl;
      let romName;

      const vpsGame = await vpsDataService.getVpsGame(vpsid);

      if (vpsGame.table) {

        tableName = `${vpsGame?.name} (${vpsGame?.manufacturer} ${vpsGame?.year})`;
        comment = vpsGame?.table?.comment;
        authorName = vpsGame?.table?.authors?.join(", ") ?? '';
        versionNumber = vpsGame?.table?.version ?? '';
        versionUrl = vpsGame?.table?.urls ? vpsGame?.table?.urls[0]?.url ?? '' : '';
        romName = vpsGame?.romFiles ? vpsGame?.romFiles[0]?.version ?? '' : '';

        var table = {
          '_id': mongoHelper.generateObjectId(),
          'tableName': tableName,
          'authors': [
            {
              '_id': mongoHelper.generateObjectId(),
              'authorName': authorName,
              'versions': [
                {
                  '_id': mongoHelper.generateObjectId(),
                  'versionNumber': versionNumber,
                  'versionUrl': versionUrl ?? '',
                  'romName': romName ?? '',
                  'scores': []
                }
              ],
              'vpsId': vpsid,
              'comment': comment
            }
          ]
        }

        let existingTable = await mongoHelper.findOne({ tableName: tableName }, 'tables');

        if (!existingTable) {
          await mongoHelper.insertOne(table, 'tables');
          retVal = `${table.tableName} (${table.authors[0]?.authorName} ${table.authors[0]?.versions[0]?.versionNumber}) created successfully`;
        } else {
          let existingAuthor = existingTable?.authors?.find(a => a.vpsId === vpsid);
          let existingVersion = existingAuthor?.versions?.find(v => v.versionNumber === versionNumber);

          let filter;
          let update;
          let options;

          if (!existingAuthor) {
            filter = { tableName: existingTable.tableName };
            options = null;
            update = {
              $push: {
                'authors':
                {
                  '_id': mongoHelper.generateObjectId(),
                  'authorName': authorName,
                  'versions': [
                    {
                      'versionNumber': versionNumber,
                      'versionUrl': versionUrl ?? '',
                      'romName': romName ?? '',
                      'scores': []
                    }],
                  'vpsId': vpsid,
                  'comment': comment
                }
              }
            };

            retVal = `New author and version created for ${existingTable.tableName}.`;
          } else {
            if (!existingVersion) {
              filter = { tableName: existingTable.tableName };
              options = {
                arrayFilters: [
                  { 'a.vpsId': vpsid }
                ]
              };
              update = {
                $push: {
                  'authors.$[a].versions':
                  {
                    '_id': mongoHelper.generateObjectId(),
                    'versionNumber': versionNumber,
                    'versionUrl': versionUrl ?? '',
                    'romName': romName ?? '',
                    'scores': []
                  }
                }
              };

              retVal = `New version created for ${existingTable.tableName} (${existingAuthor.authorName}).`;
            } else {
              retVal = `${existingTable.tableName} (${existingAuthor.authorName}) (${versionNumber}) already exists.`;
            }
          }

          if (filter && update) {
            await mongoHelper.updateOne(filter, update, options, 'tables');
          }
        }

        if (message) {
          await channel.send({ content: `**Trying to create new high score table:** ${retVal}`, ephemeral: ephemeral });
        } else {
          if (!interaction.replied) {
            interaction.reply({ content: retVal, ephemeral: ephemeral });
          }
        }

      } else {
        retVal = `No VPS Tables were found.  Please double check your VPS Id.`;
      }

      return retVal;

    } catch (e) {
      logger.error(e);
      interaction.reply({ content: e.message, ephemeral: ephemeral });
    }
  },
}
