const { ObjectId } = require("mongodb");

class SearchPipelineHelper {
    constructor(searchTerm) {
        this.pipeline = [
            { $match: {tableName:{$regex:'.*' + searchTerm + '.*', $options: 'i'}}},
            { $unwind: "$authors" },
            { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
            { $project: {
              tableId: { $toString: "$_id" },
              tableName: '$tableName',
              authorId: { $toString: "$authors._id" },
              authorName: "$authors.authorName",
              vpsId: "$authors.vpsId",
              versionId: { $toString: "$authors.versions._id" },
              versionNumber: '$authors.versions.versionNumber',
              tableUrl: '$authors.versions.versionUrl',
              scores: '$authors.versions.scores',
              postUrl: { $last: '$authors.versions.scores.postUrl'},
              _id: 0
            }},
            { $sort: { tableName: 1, authorName: -1, versionNumber: -1 } }
          ];
    }
}

class SearchScorePipelineHelper {
  constructor(vpsId, versionNumber) {
    this.pipeline = [
      { $unwind: "$authors" },
      { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
      { $unwind: { "path": "$authors.versions.scores", "preserveNullAndEmptyArrays": true } },
      { $project: {
        tableName: '$tableName',
        authorName: "$authors.authorName",
        vpsId: "$authors.vpsId",
        versionNumber: '$authors.versions.versionNumber',
        score: '$authors.versions.scores.score',
        user: '$authors.versions.scores.user',
        _id: 0
      }},
      { $sort: {tableName: 1, authorName: -1, versionNumber: -1, score: -1} },
      { $group: {
        _id: {
          tableName: '$tableName',
          authorName: "$authorName",
          vpsId: "$vpsId",
          versionNumber: '$versionNumber',
          score: '$score',
          user: '$user'
        }
      }},
      { $replaceRoot:{newRoot:"$_id"} },
      { $sort: {tableName: 1, authorName: -1, versionNumber: -1, score: -1} },
      { $match: { "vpsId" : vpsId , "versionNumber" : versionNumber} },
      { $limit: 1 }
    ];
  }
}

class SearchScoreByVpsIdUsernameScorePipelineHelper {
  constructor(data) {
    this.pipeline = [
      { $unwind: "$authors" },
      { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
      { $unwind: { "path": "$authors.versions.scores", "preserveNullAndEmptyArrays": true } },
      { $project: {
        tableId: '$_id',
        tableName: '$tableName',
        authorId: '$authors._id',
        authorName: "$authors.authorName",
        vpsId: "$authors.vpsId",
        versionId: '$authors.versions._id',
        versionNumber: '$authors.versions.versionNumber',
        tableUrl: '$authors.versions.versionUrl',
        scoreId: '$authors.versions.scores._id',
        user: '$authors.versions.scores.user',
        userName: '$authors.versions.scores.username',
        score: '$authors.versions.scores.score',
        posted: '$authors.versions.scores.createdAt',
        postUrl: '$authors.versions.scores.postUrl',
        _id: 0
      }},
      { $match: {
        "$expr": {
          "$and": [
            { "$eq": ["$vpsId", data.vpsId] },
            { "$eq": ["$userName", data.u] },
            { "$eq": ["$score", data.s] }
          ]
        },
      }}
    ];
  }
}

class AllPipelineHelper {
  constructor() {
      this.pipeline = [
          { $unwind: "$authors" },
          { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
          { $project: {
            tableId: { $toString: "$_id" },
            tableName: '$tableName',
            authorId: { $toString: "$authors._id" },
            authorName: "$authors.authorName",
            versionId: { $toString: "$authors.versions._id" },
            versionNumber: '$authors.versions.versionNumber',
            tableUrl: '$authors.versions.versionUrl',
            scores: '$authors.versions.scores',
            postUrl: { $last: '$authors.versions.scores.postUrl'},
            _id: 0
          }},
          { $sort: { tableName: 1, authorName: -1, versionNumber: -1 } }
      ];
  }
}

class RankingPipelineHelper {
  constructor(weeks, players) {
      this.pipeline = [
        {
          '$match': {
            'weekNumber': {
              '$in': weeks
            }
          }
        }, {
          '$unwind': {
            'path': '$scores'
          }
        }, {
          '$project': {
            '_id': 0, 
            'username': '$scores.username', 
            'score': '$scores.score'
          }
        }, {
          '$group': {
            '_id': '$username', 
            'total': {
              '$sum': '$score'
            }
          }
        }, {
          '$sort': {
            'total': -1
          }
        },
        // {
        //   '$match': {
        //     '_id': {
        //       '$in': players
        //     }
        //   }
        // }
      ];
  }
}


module.exports = { 
  SearchPipelineHelper, 
  SearchScorePipelineHelper, 
  SearchScoreByVpsIdUsernameScorePipelineHelper, 
  AllPipelineHelper, 
  RankingPipelineHelper
}